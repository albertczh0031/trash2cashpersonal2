from pathlib import Path
from django.core.management.base import BaseCommand
from datetime import datetime

def parse_bool(val):
    """Convert a string to boolean."""
    return str(val).strip().lower() in ('1', 'true', 'yes', 'y')

def parse_date(val):
    """Convert a string to a datetime object. Expects 'YYYY-MM-DD' format."""
    try:
        return datetime.strptime(val.strip(), '%Y-%m-%d')
    except Exception:
        return None

class Command(BaseCommand):
    help = "Populate VoucherInstance objects from voucher_instances.txt"

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default=None,
            help='Path to voucher_instances.txt (default: rewards_mock_data/voucher_instances.txt)'
        )

    def handle(self, *args, **options):
        from rewards.models import VoucherInstance, Voucher
        from users.models import Profile
        from django.contrib.auth.models import User

        file_path = options['file'] or 'rewards/rewards_mock_data/voucher_instances.txt'  # Relative path to the .txt file
        file_path = Path(file_path)
        if not file_path.exists():
            self.stderr.write(f'File not found: {file_path}')
            return

        # Delete all existing VoucherInstance objects before repopulating
        deleted_count, _ = VoucherInstance.objects.all().delete()
        self.stdout.write(f'Deleted {deleted_count} existing VoucherInstance objects.')

        created = 0
        skipped = 0
        errors = 0
        with file_path.open('r', encoding='utf-8') as fh:
            for lineno, raw in enumerate(fh, start=1):
                line = raw.strip()
                if not line or line.startswith('#'):
                    continue
                parts = [p.strip() for p in line.split(',')]
                if len(parts) < 2:
                    self.stderr.write(f'Line {lineno}: skipping, need at least voucher_id and user_identifier: {line}')
                    skipped += 1
                    continue
                voucher_key, user_ident = parts[0], parts[1]
                redeemed = parse_bool(parts[2]) if len(parts) >= 3 else False
                date_val = parse_date(parts[3]) if len(parts) >= 4 else None
                # Resolve voucher
                try:
                    if voucher_key.isdigit():
                        voucher = Voucher.objects.get(voucher_id=int(voucher_key))
                    else:
                        voucher = Voucher.objects.get(name=voucher_key)
                except Exception as e:
                    self.stderr.write(f"Line {lineno}: failed to find Voucher '{voucher_key}': {e}")
                    errors += 1
                    continue
                # Resolve profile
                profile = None
                try:
                    if user_ident.isdigit():
                        try:
                            profile = Profile.objects.get(pk=int(user_ident))
                        except Exception:
                            try:
                                user = User.objects.get(pk=int(user_ident))
                                profile = Profile.objects.get(user=user)
                            except Exception:
                                profile = None
                    else:
                        try:
                            user = User.objects.get(username=user_ident)
                            profile = Profile.objects.get(user=user)
                        except Exception:
                            profile = None
                    if profile is None:
                        raise LookupError(f'Profile not found for identifier "{user_ident}"')
                except Exception as e:
                    self.stderr.write(f"Line {lineno}: failed to find Profile for '{user_ident}': {e}")
                    errors += 1
                    continue
                # Create instance
                try:
                    kwargs = {
                        'voucher': voucher,
                        'user': profile,
                        'redeemed': redeemed,
                    }
                    if date_val:
                        kwargs['date'] = date_val
                    vi = VoucherInstance.objects.create(**kwargs)
                    self.stdout.write(f'Line {lineno}: created VoucherInstance id={vi.pk} for voucher={voucher.voucher_id} profile={profile.pk}')
                    created += 1
                except Exception as e:
                    self.stderr.write(f'Line {lineno}: failed to create VoucherInstance: {e}')
                    errors += 1
        self.stdout.write(f'Done. created={created} skipped={skipped} errors={errors}')


