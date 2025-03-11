import { UploadImage } from "@/components/helper/image/UploadImage";
import { Prisma } from "@/components/helper/prisma/Prisma";
import cloudinary from "@/utils/cloudinary";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

// Utility function to safely retrieve string values
const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

// Utility function to safely retrieve number values
const getNumberValue = (formData: FormData, key: string): number | null => {
  const value = formData.get(key);
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      return NextResponse.json(
        { message: "User not logged in or userId missing" },
        { status: 401 },
      );
    }

    // Check for existing application
    const existingApplication = await Prisma.application.findFirst({
      where: { userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: "User has already submitted an application" },
        { status: 400 },
      );
    }

    // Extract form data from the request
    const formData = await req.formData();

    // Use utility functions to safely get values
    const studentName = getStringValue(formData, "studentName");
    const email = getStringValue(formData, "email");
    const fatherName = getStringValue(formData, "fatherName");
    const motherName = getStringValue(formData, "motherName");
    const birthDay = getStringValue(formData, "birthDay");
    const bloodGroup = getStringValue(formData, "bloodGroup");
    const mobileNumber = getStringValue(formData, "mobileNumber");
    const guardianNumber = getStringValue(formData, "guardianNumber");
    const gender = getStringValue(formData, "gender");
    const religion = getStringValue(formData, "religion");
    const fullAddress = getStringValue(formData, "fullAddress");
    const district = getStringValue(formData, "district");
    const education = getStringValue(formData, "education");
    const board = getStringValue(formData, "educationBoard");
    const rollNumber = getStringValue(formData, "rollNumber");
    const regNumber = getStringValue(formData, "regNumber");
    const passingYear = getStringValue(formData, "passingYear");
    const gpa = getStringValue(formData, "gpaCgpa");
    const nid = getStringValue(formData, "nidBirthReg");
    const nationality = getStringValue(formData, "nationality");
    const course = getStringValue(formData, "course");
    const duration = getStringValue(formData, "duration");
    const pc = getStringValue(formData, "pc");
    const session = getNumberValue(formData, "session");
    const transactionId = getStringValue(formData, "trxId");
    const fatherOccupation = getStringValue(formData, "fatherOccupation");
    const maritalStatus = getStringValue(formData, "maritalStatus");

    if (session === null) {
      return NextResponse.json(
        { message: "Invalid session value" },
        { status: 400 },
      );
    }

    console.log(formData);

    // Handle file upload
    let imageUrl = { secure_url: "", public_id: "" };
    const imageFile = formData.get("image") as Blob;

    if (imageFile) {
      try {
        imageUrl = await UploadImage(imageFile, "application-images/");
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 },
        );
      }
    }

    // Generate new roll number
    let roll = 2000;
    const lastApplication = await Prisma.application.findFirst({
      orderBy: { createdAt: "desc" },
      select: { roll: true },
    });

    if (lastApplication?.roll) {
      roll = lastApplication.roll + 1;
    }

    // Use utility function for birthDay

    // Validate date format
    if (!birthDay || isNaN(Date.parse(birthDay))) {
      return NextResponse.json(
        { message: "Invalid birth date format. Use ISO format (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // Convert to Date object if needed
    const birthDate = new Date(birthDay);
    // Create a new application
    try {
      const newApplication = await Prisma.application.create({
        data: {
          studentName,
          fatherName,
          motherName,
          birthDay: birthDate,
          bloodGroup,
          mobileNumber,
          guardianNumber,
          gender,
          religion,
          fullAddress,
          district,
          education,
          board,
          rollNumber,
          regNumber,
          passingYear,
          gpa,
          nid,
          nationality,
          course,
          duration,
          email,
          pc,
          userId,
          roll,
          transactionId,
          fatherOccupation,
          maritalStatus,
          session,
          image: imageUrl.secure_url,
          imageId: imageUrl.public_id,
          status: "Pending",
          certificate: "Pending",
        },
      });

      return NextResponse.json(newApplication, { status: 201 });
    } catch (createError) {
      console.error("Application creation failed:", createError);
      return NextResponse.json(
        { message: "Application creation failed" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Form processing failed:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      return new NextResponse("User not logged in or authorId missing");
    }

    const existingApplication = await Prisma.application.findFirst({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        studentName: true,
        duration: true,
        image: true,
        status: true,
        course: true,
        createdAt: true,
        certificate: true,
        roll: true,
      },
    });

    if (existingApplication) {
      return new NextResponse(JSON.stringify(existingApplication), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new NextResponse("No Application Found", { status: 200 });
    }
  } catch (error) {
    return new NextResponse("An error occurred", { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    const userId = token?.sub;
    const userEmail = token?.email;

    if (!token || (!userId && !userEmail)) {
      return new NextResponse("User not logged in or userId/userEmail missing");
    }

    const search = req.nextUrl.searchParams;
    const applicationId = search.get("id");

    if (!applicationId) {
      return new NextResponse("Application ID not provided", { status: 400 });
    }

    const application = await Prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        userId: true,
        image: true,
        imageId: true,
      },
    });

    console.log(application);

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // Check if the user has the right to delete the application
    if (userId === application.userId || token.role === "ADMIN") {
      // Check if there’s an image to delete
      if (application.imageId) {
        const result = await cloudinary.uploader.destroy(application.imageId);
        if (result.result !== "ok") {
          return new NextResponse("error", { status: 400 });
        }
      }

      await Prisma.application.delete({
        where: {
          id: applicationId,
        },
      });

      return new NextResponse("Application deleted successfully", {
        status: 200,
      });
    } else {
      // User does not have the right to delete the application
      return new NextResponse("Unauthorized to delete this application", {
        status: 403,
      });
    }
  } catch (error) {
    console.log(error);
    return new NextResponse("Error deleting application", { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = getStringValue(formData, "id");
    const token = await getToken({ req, secret });

    if (!id || !token) {
      return new NextResponse("Product ID and token are required", {
        status: 400,
      });
    }

    const role = token.role;

    // Check if the user is an admin or if they are the author and the application is editable
    const currentDesign = await Prisma.application.findUnique({
      where: { id: id },
    });

    if (!currentDesign) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // If the role is not ADMIN, make sure the user is the author and the application is editable
    if (role !== "ADMIN") {
      if (token.sub !== currentDesign.userId) {
        return new NextResponse(
          "Unauthorized: You are not the author of this application",
          {
            status: 403,
          },
        );
      }

      if (currentDesign.editable === false || currentDesign.editable === null) {
        return new NextResponse("Application is not editable", { status: 400 });
      }
    }

    const deletedImage = getStringValue(formData, "deletedImage");
    const imageFile = formData.get("image") as Blob;

    let image = currentDesign.image;
    let imageId = currentDesign.imageId;

    // Handle image deletion if flagged
    if (deletedImage && currentDesign.imageId) {
      const deleteResult = await cloudinary.uploader.destroy(
        currentDesign.imageId,
      );
      if (deleteResult.result !== "ok") {
        return new NextResponse("Error deleting image", { status: 400 });
      }
      image = "";
      imageId = "";
    }

    // Upload new image if provided
    if (imageFile) {
      const imageUrl = await UploadImage(imageFile, "application-images/");
      image = imageUrl.secure_url;
      imageId = imageUrl.public_id;
    }

    // Prepare updated data
    const updatedData: Record<string, string | number | Date | boolean | null> =
      {};

    formData.forEach((value, key) => {
      if (key !== "id" && key !== "image" && key !== "deletedImage") {
        if (key === "session") {
          const intValue = parseInt(value.toString(), 10);
          if (isNaN(intValue)) {
            throw new Error(`Invalid session value: ${value}`);
          }
          updatedData[key] = intValue;
        } else if (key === "editable") {
          updatedData[key] = value === "true";
        } else {
          updatedData[key] = value.toString();
        }
      }
    });

    // Add image and imageId to updatedData
    updatedData.image = image;
    updatedData.imageId = imageId;

    // Perform the update operation
    const updatedDesign = await Prisma.application.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({
      message: "Design updated successfully",
      design: updatedDesign,
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
