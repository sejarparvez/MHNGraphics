import { z } from 'zod';

const currentYear = new Date().getFullYear();
const MAX_FILE_SIZE = 300000;
const BLOOD_BANK_IMAGE_SIZE = 100000; // 100KB for blood bank images
const NOTICE_PDF_SIZE = 5000000; // 5MB for notice PDFs
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const SingInSchema = z.object({
  email: z.string().refine(
    (value) =>
      /\S+@\S+\.\S+/.test(value) || // Check for valid email format
      /^01[0-9]{9}$/.test(value), // Check for valid Bangladeshi phone number without country code
    {
      message: 'Please enter a valid email or phone number',
    },
  ),
  password: z
    .string()
    .min(6, 'Password must be 6 characters long')
    .max(15, 'Password cannot be more than 15 characters'),
});

export const SignUpSchema = z.object({
  name: z.string().min(4, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z
    .string()
    .refine(
      (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^\d{10,15}$/.test(value),
      {
        message: 'Must be a valid email or phone number.',
      },
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password cannot exceed 64 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

  code: z.string().optional(),
});

export const NewDesignSchema = z.object({
  name: z
    .string()
    .min(10, 'Name must be at least 10 characters')
    .max(200)
    .trim()
    .regex(
      /^[^\s_]+(?:[\s^\s_][^\s_]+)*$/,
      'Name must not include underscores (_).',
    ),
  description: z.string().trim(),
  category: z.string().min(1, 'Required'),
  tags: z.array(z.string()),
});

export type NewDesignSchemaType = z.infer<typeof NewDesignSchema>;

export const PaymentFormSchema = z.object({
  receiveDate: z.date({
    required_error: 'Payment receive date is required',
  }),
  paymentMonth: z.date({
    required_error: 'Payment month is required',
  }),
  amount: z.string().refine(
    (value) => {
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= -100000 && num <= 100000;
    },
    {
      message: 'Amount must be between -100,000 and 100,000',
    },
  ),
  comment: z
    .string()
    .min(2, 'Comment is required')
    .max(70, 'Comment is too long'),
});

export type PaymentFormSchemaType = z.infer<typeof PaymentFormSchema>;

export const BloodDonationSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' }),
  birthDay: z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
      'Date must be in the format DD/MM/YYYY',
    ),
  bloodGroup: z.string().min(1, { message: 'Blood group is required' }),
  allergies: z.enum(['Yes', 'No'], { required_error: 'Allergies is required' }),
  donatedBefore: z.enum(['Yes', 'No'], {
    required_error: 'Donated before is required',
  }),
  diseases: z.enum(['Yes', 'No'], { required_error: 'Diseases is required' }),
  district: z.string().min(1, { message: 'District is required' }),
  address: z
    .string()
    .min(2, { message: 'Address must be at least 2 characters' }),
  Occupation: z.string().min(1, { message: 'Occupation is required' }),
  number: z.string().regex(/^(?:\+?88)?01[0-9]{9}$/, {
    message: 'Must be a valid 11-digit phone number',
  }),
  number2: z.string().optional(),
  image: z
    .any()
    .optional()
    .refine(
      (file) => !file || file?.size <= BLOOD_BANK_IMAGE_SIZE,
      `Image size must be less than 100KB`,
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only .jpg, .jpeg, .png, and .webp files are allowed',
    ),
});

export const HeroBannerSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters'),
  subtitle: z
    .string()
    .max(200, 'Subtitle must be under 200 characters')
    .optional(),
  slogan: z.string().max(80, 'Slogan must be under 80 characters').optional(),
  bannerPosition: z.string().min(1, 'Position is required'),
  alignment: z.enum(['left', 'center', 'right']),
  tag: z.string().max(40, 'Tag must be under 40 characters').optional(),
  isActive: z.boolean(),
  image: z
    .custom<Blob | null>()
    .refine((file) => file instanceof Blob, 'Banner image is required')
    .refine(
      (file) => !file || file?.size <= 2 * 1024 * 1024,
      'Image must be under 2 MB',
    )
    .refine(
      (file) =>
        !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file?.type),
      'Only JPG, PNG, or WebP allowed',
    ),
});

export const NoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  pdf: z
    .any()
    .refine((file) => file instanceof Blob, 'PDF file is required')
    .refine((file) => file?.size <= NOTICE_PDF_SIZE, 'Max file size is 5MB')
    .refine((file) => file?.type === 'application/pdf', 'File must be a PDF'),
});

export const SubscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const ApplicationSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(1, 'Student name is required')
    .max(40, 'Must be 40 characters or less'),

  fatherName: z
    .string()
    .trim()
    .min(1, "Father's name is required")
    .max(40, 'Must be 40 characters or less'),

  motherName: z
    .string()
    .trim()
    .min(1, "Mother's name is required")
    .max(40, 'Must be 40 characters or less'),

  fatherOccupation: z
    .string()
    .trim()
    .min(1, "Father's occupation is required")
    .max(40, 'Must be 40 characters or less'),

  birthDay: z.date(),

  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'Mobile number must be between 10-15 digits'),

  guardianNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'Guardian number must be between 10-15 digits'),

  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender is required and must be valid' }),
  }),

  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], {
    errorMap: () => ({ message: 'Marital status is required' }),
  }),

  bloodGroup: z
    .string()
    .trim()
    .regex(/^(A|B|AB|O)[+-]$/, 'Blood group must be valid (e.g., A+, B-, O+)'),

  religion: z.string().trim().min(1, 'Religion is required'),

  nationality: z.string().trim().min(1, 'Nationality is required'),

  nidBirthReg: z.string().trim().min(1, 'NID/Birth registration is required'),

  email: z.string().trim().email('Invalid email address').optional(),

  fullAddress: z.string().trim().min(5, 'Full address is required'),

  district: z.string().trim().min(1, 'District is required'),

  education: z.string().trim().min(1, 'Education is required'),

  educationBoard: z.string().trim().min(1, 'Education board is required'),

  rollNumber: z.string().trim().min(1, 'Roll number is required'),

  regNumber: z.string().trim().min(1, 'Registration number is required'),

  passingYear: z
    .number({
      required_error: 'Passing year is required',
      invalid_type_error: 'Passing year must be a number',
    })
    .min(1990, 'Passing year must be 1990 or later')
    .max(currentYear, `Passing year cannot be later than ${currentYear}`),

  gpaCgpa: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'GPA/CGPA must be a valid number (e.g., 4.00)')
    .min(1, 'GPA/CGPA is required'),

  course: z.string().trim().min(1, 'Course is required'),

  session: z
    .string()
    .regex(/^\d{4}$/, 'Session must be a valid year') // Ensures it's a 4-digit year
    .refine(
      (value) => {
        const year = parseInt(value, 10);
        const currentYear = new Date().getFullYear();
        return year >= 2010 && year <= currentYear + 1;
      },
      { message: 'Session must be between 2010 and next year' },
    ),

  duration: z.string().trim().min(1, 'Duration is required'),

  pc: z.enum(['laptop', 'pc', 'no'], {
    errorMap: () => ({ message: 'Specify if you have a computer' }),
  }),

  image: z
    .any()
    .refine((file) => file?.length === 1, 'Image is required.')
    .refine(
      (file) => file?.[0]?.size <= MAX_FILE_SIZE,
      `Image size must be less than 300KB`,
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
      'Only .jpg, .jpeg, .png, and .webp files are allowed',
    ),
});

// export type ApplicationSchemaType = z.infer<typeof ApplicationSchema>;
