import { z } from "zod";

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
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "Name must be alphanumeric.",
      }),
    email: z
      .string()
      .min(1, "The email is required.")
      .email({ message: "The email is invalid." }),
    password: passwordSchema,
    confirmPassword: requiredPasswordSchema,
    acceptPolicy: z.boolean().refine((data) => data === true, {
      message: "You must accept the terms of service and privacy policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
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
  confirmPassword: requiredPasswordSchema,
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

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type SignInType = z.infer<typeof loginInfoSchema>;
export type SignUpType = z.infer<typeof signUpSchema>;
