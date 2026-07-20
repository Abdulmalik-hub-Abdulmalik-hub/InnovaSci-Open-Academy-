import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = "abdulmalikmusba@gmail.com"
  
  console.log("=== PRISMA DATABASE INSPECTION ===")
  console.log(`Querying for email: ${email}`)
  console.log("")
  
  const user = await prisma.user.findFirst({
    where: { email: email }
  })
  
  if (user) {
    console.log("User.id:", user.id)
    console.log("User.email:", user.email)
    console.log("User.role:", user.role)
    console.log("User.status:", user.status)
    console.log("User.emailVerified:", user.emailVerified)
    console.log("User.createdAt:", user.createdAt)
    console.log("User.updatedAt:", user.updatedAt)
    console.log("User.passwordHash:", user.passwordHash ? "(exists)" : "(null)")
  } else {
    console.log("No user found with that email!")
    
    // Check if any users exist at all
    const count = await prisma.user.count()
    console.log(`\nTotal users in database: ${count}`)
    
    if (count > 0) {
      console.log("\nAll users:")
      const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true, status: true } })
      allUsers.forEach((u, i) => {
        console.log(`  ${i+1}. ${u.email} | Role: ${u.role} | Status: ${u.status}`)
      })
    }
  }
  
  console.log("\n=== END PRISMA INSPECTION ===")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
