import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  // Company
  companyName: z.string().min(2, "Nom d'entreprise requis"),
  ice: z.string().length(15, "L'ICE doit contenir 15 chiffres").regex(/^\d+$/, "L'ICE ne doit contenir que des chiffres"),
  ifField: z.string().optional(),
  rc: z.string().optional(),
  companyEmail: z.string().email("Email invalide"),
  companyPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  
  // User
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const data = result.data

    // Check if company with this ICE already exists
    const existingCompany = await prisma.company.findFirst({
      where: { 
        OR: [
          { ice: data.ice },
          { email: data.companyEmail }
        ]
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Une entreprise avec cet ICE ou cet email existe déjà" },
        { status: 409 }
      )
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create company and user in a transaction
    const { company, user } = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          ice: data.ice,
          ifField: data.ifField || null,
          rc: data.rc || null,
          email: data.companyEmail,
          phone: data.companyPhone || null,
          address: data.address || null,
          city: data.city || null,
          isApproved: false,
          approvalStatus: "PENDING",
          paymentTerms: "TRANSFER_30",
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: "CLIENT_PRO",
          isActive: true,
          companyId: company.id,
        }
      })

      // Create default address if provided
      if (data.address && data.city) {
        await tx.address.create({
          data: {
            name: "Adresse principale",
            address: data.address,
            city: data.city,
            isDefault: true,
            isBilling: true,
            isShipping: true,
            companyId: company.id,
          }
        })
      }

      return { company, user }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "COMPANY_REGISTRATION",
        entityType: "Company",
        entityId: company.id,
        metadata: {
          companyName: company.name,
          userEmail: user.email,
          ice: company.ice,
        },
        userId: user.id,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Inscription réussie. Votre compte est en attente d'approbation.",
      company: {
        id: company.id,
        name: company.name,
        approvalStatus: company.approvalStatus,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
