import type { StaticImageData } from 'next/image';

export interface PaymentReport {
  id: string;
  comment: string;
  paymentMonth: string;
  paymentReceiveDate: string;
  amount: number;
  year: string;
}

export interface Comment {
  id: string;
  user: {
    name: string;
    image: string;
  };
  createdAt: Date;
  content: string;
  design: {
    id: string;
    name: string;
  };
}

export interface Donor {
  id: string;
  name: string;
  image: string;
  bloodGroup: string;
  district: string;
  number: string;
  number2?: string;
  birthDate?: string;
  donatedBefore: string;
  diseases: string;
  allergies: string;
  address: string;
  createdAt: string;
}

export interface BloodBankData {
  users: Donor[];
  count: number;
  meta?: {
    totalPages: number;
    currentPage: number;
  };
}

export interface BloodBankQuery {
  currentPage: number;
  search: string;
  bloodGroup: string;
}

export interface PaginationProps {
  totalPages: number;
  initialPage: number;
  query: string;
  setPage: (page: number) => void;
}

export interface Design {
  id: string;
  image: string;
  imageId: string;
  name: string;
  category: string;
  subcategory: string;
  createdAt: string;
  status: string;
  description: string;
  tags: string[];
  authorId: string;
  viewCount: number;
  downloadCount: number;
  author: {
    name: string;
    image: string;
    status: string;
  };
  likes: { userId: string }[];
  likeCount: number;
  commentsCount: number;
  comments: Array<{
    id: string;
    userId: string;
    designId: string;
    content: string;
    createdAt: string;
    user: {
      name: string;
      image: string;
      status: string;
    };
  }>;
}

export interface ApplicationDetail {
  studentName: string;
  fatherName: string;
  motherName: string;
  birthDay: string;
  bloodGroup: string;
  mobileNumber: string;
  guardianNumber: string;
  gender: string;
  gpaCgpa: string;
  nationality: string;
  nidBirthReg: string;
  passingYear: string;
  regNumber: string;
  religion: string;
  rollNumber: string;
  image: string;
  fullAddress: string;
  district: string;
  courseName: string;
  duration: string;
  education: string;
  educationBoard: string;
  course: string;
  pc: string;
  email: string;
  transactionId: string;
  fatherOccupation: string;
  maritalStatus: string;
  session: string;
  trxId: string;
}

export interface UserApplication {
  id?: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  birthDay: Date;
  bloodGroup: string;
  mobileNumber: string;
  guardianNumber: string;
  gender: 'male' | 'female' | 'other';
  gpa: string;
  nationality: string;
  nid: string;
  passingYear: number;
  regNumber: string;
  religion: string;
  rollNumber: string;
  image: string;
  fullAddress: string;
  district: string;
  courseName: string;
  duration: string;
  education: string;
  board: string;
  course: string;
  pc: 'laptop' | 'pc' | 'no' | undefined;
  email: string;
  transactionId: string;
  fatherOccupation: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  roll: number;
  user: {
    phoneNumber: string;
    email: string;
  };
  session: string;
}

export interface ApplicationSummary {
  id: string;
  duration: string;
  studentName: string;
  course: string;
  image: string;
  status: string;
  createdAt: string;
  certificate: string;
  mobileNumber: string;
  editable: boolean | null;
}

export interface Testimonial {
  id: number;
  name: string;
  image: StaticImageData;
  company: string;
  position: string;
  title: string;
  duration: string;
  description: string;
}

export interface UserProfile {
  id: string;
  image: string;
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
  createdAt: Date;
  status: string;
}

export interface Address {
  id: string;
  studentName: string;
  email: string;
  image: string;
  mobileNumber: string;
  bloodGroup: string;
  fullAddress: string;
}
