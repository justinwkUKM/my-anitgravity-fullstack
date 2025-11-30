import { prisma } from './lib/prisma'

async function main() {
    // Example: Fetch all records from a collection
    const allProjects = await prisma.project.findMany()
    console.log('All projects:', JSON.stringify(allProjects, null, 2))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })