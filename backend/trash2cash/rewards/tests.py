# tests.py
from django.contrib.auth import authenticate
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rewards.models import Voucher
from users.models import User
from rewards.models import VoucherInstance
from rewards.serializer import VoucherInstanceSerializer
from users.models import Profile


class VoucherAPITest(APITestCase):
    def setUp(self):
        # Staff login
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass',
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)  # Force authentication

    def test_create_voucher(self):
        data = {
            "name": "Test Voucher",
            "points": 100,
            "description": "Get 10% off!",
            "recycle_center_code": 1234
        }
        response = self.client.post('/api/rewards/create-voucher/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Voucher.objects.count(), 1)
        self.assertEqual(Voucher.objects.first().name, "Test Voucher")

    def test_get_vouchers(self):
        Voucher.objects.create(name="Sample", points=50, description="Sample desc", recycle_center_code=111)
        response = self.client.get('/api/rewards/get-voucher/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class VoucherInstanceAPITest(APITestCase):
    def setUp(self):
        # Create user and profile
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.profile = Profile.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)  # Force authentication

        # Log in user (if authentication is required)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)  # Force authentication

        # Create a voucher
        self.voucher = Voucher.objects.create(
            name="10% Off",
            points=100,
            description="Use this for 10% off",
            recycle_center_code=1234
        )

    def test_create_voucher_instance(self):
        data = {
            "voucher": self.voucher.id,
            "user": self.profile.id,
            "redeemed": False
        }
        response = self.client.post('/api/rewards/create-voucher-instance/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VoucherInstance.objects.count(), 1)
        self.assertEqual(VoucherInstance.objects.first().voucher.name, "10% Off")

    def test_get_voucher_instances(self):
        VoucherInstance.objects.create(voucher=self.voucher, user=self.profile, redeemed=False)
        response = self.client.get('/api/rewards/get-voucher-instance/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['voucher'], self.voucher.id)