from django.db import models

from users.models import Profile, Tier

from recycler.models import RecyclingCentre


# Create your models here.
class Voucher(models.Model):
    voucher_id = models.AutoField(primary_key=True)
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE)
    discount_amt = models.DecimalField(max_digits=6, decimal_places=2)
    name = models.CharField(max_length=100)
    points = models.IntegerField()
    description = models.TextField()
    image = models.ImageField(null=True, blank=True, upload_to='vouchers/')
    recycle_center_code = models.ForeignKey(RecyclingCentre, on_delete=models.CASCADE)
    claimed_count = models.IntegerField(default=0)
    claimable_count = models.IntegerField(default=1)
    expiration_date = models.DateField()
    is_active = models.BooleanField(default=True)
    # tier = models.ForeignKey(Tier, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name
    

class VoucherInstance(models.Model):
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    redeemed = models.BooleanField(default=False) # If False that means Earned, If True means redeemed
    def __str__(self):
        return f"{self.voucher.name} - {self.user} - {self.date} - {self.voucher.points} pts - {'Redeemed' if self.redeemed else 'Earned'}"
    