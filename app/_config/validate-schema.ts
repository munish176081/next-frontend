import { z } from "zod";

export const subscribeSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Full name is required" })
    .regex(/^[A-Za-z ]+$/, {
      message: "Full name can only contain letters and spaces",
    }),
  email: z.string().email({ message: "Enter a valid email address" }),
});

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be 8 character long." })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number.",
  })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: "Password must contain at least one special character.",
  });

const requiredPasswordSchema = z
  .string()
  .min(8, { message: "Password must be 8 character long." });

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Name is required." })
      .regex(/^[a-zA-Z0-9 ]+$/, {
        message: "Name must be alphanumeric and can include spaces only.",
      })
    ,
    email: z
      .string()
      .min(1, "The email is required.")
      .email({ message: "The email is invalid." }),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    acceptPolicy: z.boolean().refine((data) => data === true, {
      message: "You must accept the terms of service and privacy policy.",
    }),
    recaptchaToken: z
      .string()
      .min(1, { message: "Please complete the reCAPTCHA verification." })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    // Only require reCAPTCHA if the site key is configured
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey && !data.recaptchaToken) {
      return false;
    }
    return true;
  }, {
    message: "Please complete the reCAPTCHA verification.",
    path: ["recaptchaToken"],
  });

export const loginInfoSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "The email is invalid." }),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "The email is required." })
    .email({ message: "The email is invalid." }),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export const booleanCoerce = z
  .union([z.string(), z.number(), z.boolean()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string")
      return val.toLowerCase() === "true" || val === "1";
    if (typeof val === "number") return val === 1;
    return false;
  });

export const nullableNumber = z
  .any()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || !isNaN(Number(value)), {
    message: "Invalid number",
  })
  .transform((value) => (value === null ? null : Number(value)));

export const locationSchema = z.object({
  address: z
    .string({ message: "Please enter address" })
    .min(1, { message: "Please enter address" }),
  lat: z
    .number({ message: "Please select address" })
    .min(-90, { message: "Please select address" })
    .max(90, { message: "Please select address" }),
  lng: z
    .number({ message: "Please select address" })
    .min(-180, { message: "Please select address" })
    .max(180, { message: "Please select address" }),
});

export const optionalLocationSchema = z.object({
  address: z.string({ message: "Please enter address" }).optional(),
  lat: z
    .number({ message: "Please select address" })
    .min(-90, { message: "Please select address" })
    .max(90, { message: "Please select address" })
    .optional(),
  lng: z
    .number({ message: "Please select address" })
    .min(-180, { message: "Please select address" })
    .max(180, { message: "Please select address" })
    .optional(),
});

export const videoUrlSchema = z.string().url();
// .refine(
//   (url) => {
//     return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(
//       url
//     );
//   },
//   {
//     message: "Invalid video URL. Only YouTube and Vimeo URLs are allowed.",
//   }
// );

export const getImagesSchema = ({
  maxFileSize,
  maxImages,
  minImages,
}: {
  maxImages: number;
  maxFileSize: number;
  minImages: number;
}) =>
  z
    .array(
      z
        .any()
        .refine((file) => {
          return file?.size <= maxFileSize;
        }, `Max image size is 1MB.`)
        .refine(
          (file) => file?.type?.includes("image"),
          "Only image files are supported."
        )
    )
    .min(minImages, { message: `At least ${minImages} images are required!` })
    .max(maxImages, {
      message: `Maximum of ${maxImages} images are allowed`,
    })
    .default([]);

export const listingFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  breed: z.string().min(1, { message: "Breed is required." }),
  age: z.string().min(1, { message: "Age is required." }),
  dogName: z.string().min(1, { message: "Dog name is required." }),
  studFee: z.string().min(1, { message: "Stud fee is required." }),
  microchipNumber: z.array(z.string().min(1, { message: "Microchip number is required." })).min(1, { message: "At least one microchip number is required." }),
  semenType: z.string().min(1, { message: "Semen type is required." }),
  collectionDate: z.string().min(1, { message: "Collection date is required." }),
  ankcNumber: z.string().min(1, { message: "ANKC/Breeder registration number is required." }),
  shippingAvailability: z.string().min(1, { message: "Shipping availability is required." }),
  contactName: z.string().min(1, { message: "Name is required." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }),
  email: z.string().min(1, { message: "Email is required." }).email({ message: "Invalid email format." }),
  location: z.string().min(1, { message: "Location is required." }),
  additionalNotes: z.string().optional(),
});

// Puppy Litter Listing validation schema
export const puppyLitterListingSchema = z.object({
  // Special fields
  listingType: z.enum(['litter', 'puppy'], {
    required_error: "Please select whether this is a litter or single puppy listing",
  }),
  
  // Litter-specific fields
  listLitterOption: z.enum(['same-details', 'add-individually', 'single-puppy']).optional(),
  litterSize: z.union([z.string(), z.number()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? undefined : num;
  }).refine((val) => val === undefined || (val >= 1 && val <= 20), {
    message: "Litter size must be between 1 and 20"
  }).optional(),
  
  // Common fields
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  breed: z.string().min(1, "Breed is required"),
  location: z.string().optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),
  
  // Pricing fields
  pricingOption: z.enum(['fixedPrice', 'displayPriceRange', 'priceOnRequest'], {
    required_error: "Please select a pricing option",
  }),
  fixedPrice: z.union([z.string(), z.number()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }).optional(),
  minPrice: z.union([z.string(), z.number()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }).optional(),
  maxPrice: z.union([z.string(), z.number()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }).optional(),
  
  // Delivery options
  deliveryOptions: z.array(z.string()).min(1, "Please select at least one delivery option"),
  
  // DNA Results (optional)
  dnaResults: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return [];
    if (typeof val === "string") return [];
    return Array.isArray(val) ? val : [];
  }).optional(),
  
  // Microchip numbers for same-details option
  microchipNumbers: z.array(z.string().min(1, "Microchip number is required")).optional(),
  
  // Individual puppies for add-individually option and single puppy
  individualPuppies: z.array(z.object({
    puppyImages: z.array(z.string()).min(1, "At least one puppy image is required"),
    microchipNumber: z.string().min(1, "Microchip number is required"),
    puppyGender: z.enum(['male', 'female', 'both'], { required_error: "Puppy gender is required" }),
    puppyColour: z.string().optional(),
    puppyDateOfBirth: z.string().min(1, "Date of birth is required"),
    vaccinationStatus: z.enum(['Up to Date', 'Partial', 'Not Started'], {
      required_error: "Vaccination status is required"
    }),
  })).optional(),
  
  // Optional fields
  healthCertificates: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return [];
    if (typeof val === "string") return [];
    return Array.isArray(val) ? val : [];
  }).optional(),
  badges: z.array(z.string()).optional(),
  
  // Pricing details
  startingPrice: z.union([z.string(), z.number()]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }).refine((val) => val === undefined || val >= 0, {
    message: "Starting price must be a positive number"
  }).optional(),
  priceDetailsAndAddOns: z.string().optional(),
}).refine((data) => {
  // Validate pricing based on pricing option
  if (data.pricingOption === 'fixedPrice' && (data.fixedPrice === undefined || data.fixedPrice <= 0)) {
    return false;
  }
  if (data.pricingOption === 'displayPriceRange' && (data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= 0 || data.maxPrice <= 0)) {
    return false;
  }
  if (data.pricingOption === 'displayPriceRange' && data.minPrice && data.maxPrice && data.minPrice >= data.maxPrice) {
    return false;
  }
  return true;
}, {
  message: "Please provide valid pricing information based on your selected pricing option",
  path: ["pricingOption"]
}).refine((data) => {
  // Validate litter-specific fields
  if (data.listingType === 'litter') {
    if (!data.listLitterOption) {
      return false;
    }
    if (data.listLitterOption === 'same-details' && !data.litterSize) {
      return false;
    }
    if (data.listLitterOption === 'add-individually' && (!data.individualPuppies || data.individualPuppies.length === 0)) {
      return false;
    }
  }
  
  // Validate single puppy fields
  if (data.listingType === 'puppy') {
    if (!data.individualPuppies || data.individualPuppies.length === 0) {
      return false;
    }
    if (data.individualPuppies.length !== 1) {
      return false;
    }
    // Ensure listLitterOption is set to 'single-puppy' for single puppy listings
    if (data.listLitterOption !== 'single-puppy') {
      return false;
    }
  }
  
  return true;
}, {
  message: "Please complete all required fields for your selected listing type",
  path: ["listingType"]
});

export const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone number is required"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  recaptchaToken: z
      .string()
      .min(1, { message: "Please complete the reCAPTCHA verification." })
});

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(256, { message: "Name must be less than 256 characters." })
    .regex(/^[a-zA-Z0-9 ]+$/, {
      message: "Name must be alphanumeric and can include spaces only.",
    }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(256, { message: "Username must be less than 256 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format." }),
  imageUrl: z
    .string()
    .url({ message: "Please provide a valid image URL." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, { message: "Phone number is required." }),
  bio: z
    .string()
    .max(250, { message: "Bio must be 250 characters or less." })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url({ message: "Please provide a valid website URL." })
    .optional()
    .or(z.literal("")),
  businessName: z
    .string()
    .min(1, { message: "Business or Breeders name is required." })
    .max(256, { message: "Business name must be less than 256 characters." }),
  businessABN: z
    .string()
    .min(1, { message: "Business ABN is required." })
    .regex(/^\d{11}$/, { message: "ABN must be exactly 11 digits." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(1000, { message: "Description must be 1000 characters or less." }),
  location: z
    .string()
    .min(1, { message: "Location is required." })
    .max(256, { message: "Location must be less than 256 characters." }),
  idVerification: z
    .object({
      governmentId: z.array(z.string()).min(1, { message: "Please upload at least one government-issued ID." }),
      selfieWithId: z.array(z.string()).min(1, { message: "Please upload at least one image of yourself holding the ID." }),
    })
    .optional(),
});

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type SignInType = z.infer<typeof loginInfoSchema>;
export type SignUpType = z.infer<typeof signUpSchema>;
export type ListingFormType = z.infer<typeof listingFormSchema>;
export type ContactFormType = z.infer<typeof contactFormSchema>;
export type UpdateUserProfileType = z.infer<typeof updateUserProfileSchema>;
export type SubscribeFormType = z.infer<typeof subscribeSchema>;
