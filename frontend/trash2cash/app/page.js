"use client";

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/landing"); // Immediately send to login page
}

// 'use client';

// import { useState } from 'react';
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter
// } from "@/components/ui/card";
// import UploadPhoto from "./upload/UploadPhoto.jsx"; // adjust path if needed

// export default function Home() {
//   // State to manage form data
//   // setFormData is a function that updates the formData state variable
//   // formData is an object that contains the values of the form fields
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     password2: '',
//     first_name: '',
//     last_name: '',
//     street: '',
//     postcode: '',
//     city: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [successMessage, setSuccessMessage] = useState('');

//   // Function to handle input changes from the form
//   // e is the event object that contains information about the input change
//   // setFormData is called to update the formData state variable with the new value
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       // e.target.id is the id of the input field that triggered the change
//       [e.target.id]: e.target.value,
//     });
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.username.trim()) newErrors.username = 'Username is required.';
//     if (!formData.email.includes('@')) newErrors.email = 'Invalid email address.';
//     if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
//     if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match.';
//     if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
//     if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';
//     if (!formData.street.trim() || !formData.postcode.trim() || !formData.city.trim()) {
//       newErrors.address = 'Street, Postcode, and City are required.';
//     }

//     setErrors(newErrors);
//     // If there are no errors, return true
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccessMessage('');
//     console.log('Payload being sent:', formData);
//     if (!validateForm()) return;
//     console.log('Payload being sent:', formData);
//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/signup/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error('Signup failed');
//       }

//       const data = await response.json();
//       console.log('Signup success:', data);
//       setSuccessMessage('Signup successful!');
//     } catch (error) {
//       console.error('Signup error:', error);
//       setErrors({ general: 'Signup failed. Please try again.' });
//     }
//   };

//   return (
//     <main className="font-sans flex flex-col space-y-10">
//       <title>Signup</title>
//       <div className="px-8 py-8 text-center">
//         <p className="text-4xl">
//           Create an account
//         </p>
//         <p>
//           Already have an account? Log in
//         </p>
//       </div>

//       <div className="flex items-center justify-center px-4">
//         <Card className="w-auto">
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <p><u>Account details</u></p>
//               <div className="grid w-full items-center gap-4">
//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="username">What's your username?</Label>
//                   <Input id="username" placeholder="Enter your user name" value={formData.username} onChange={handleChange} />
//                   {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="email">What's your email?</Label>
//                   <Input id="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} />
//                   {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="password">Create a password</Label>
//                   <Input id="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
//                   {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
//                   <p className="text-left text-xs text-stone-500">Use 8 or more characters with a mix of letters, numbers</p>
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="password2">Re-enter your password</Label>
//                   <Input id="password2" type="password" placeholder="Re-enter your password" value={formData.password2} onChange={handleChange} />
//                   {errors.password2 && <p className="text-red-500 text-sm">{errors.password2}</p>}
//                 </div>
//               </div>

//               <br />

//               <p><u>Personal details</u></p>
//               <div className="grid w-full items-center gap-4">
//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="first_name">What's your first name?</Label>
//                   <Input id="first_name" placeholder="Enter your first name" value={formData.first_name} onChange={handleChange} />
//                   {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="last_name">What's your last name?</Label>
//                   <Input id="last_name" placeholder="Enter your last name" value={formData.last_name} onChange={handleChange} />
//                   {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
//                 </div>
//               </div>

//               <br />

//               <p><u>Address</u></p>
//               <div className="grid w-full items-center gap-4">
//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="street">Street name</Label>
//                   <Input id="street" placeholder="Enter your street name" value={formData.street} onChange={handleChange} />
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="postcode">Post code</Label>
//                   <Input id="postcode" placeholder="Enter your post code" value={formData.postcode} onChange={handleChange} />
//                 </div>

//                 <div className="flex flex-col space-y-1">
//                   <Label htmlFor="city">City name</Label>
//                   <Input id="city" placeholder="Enter your city name" value={formData.city} onChange={handleChange} />
//                 </div>
//                 {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
//               </div>

//               <br />

//               <CardFooter className="grid w-full items-center gap-2">
//                 {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}
//                 {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
//                 <p className="text-xs text-center">By creating an account, you agree to the Terms of use and Privacy Policy.</p>
//                 <Button type="submit" className="bg-green-500 hover:bg-green-600">Create an account</Button>
//               </CardFooter>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   );
// }
