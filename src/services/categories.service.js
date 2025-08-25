
const createPrismaClient = require('../config/database.js'); // Factory returning a singleton Prisma client (shared DB connection for the app)
const { AppError } = require('../middleware/error.middleware.js'); // Centralized operational error type consumed by global error middleware

// Service layer: encapsulates all "Category" read operations.
// Role in project: supplies the taxonomy backbone (e.g., Compute/Storage/Database) to power Phase‑1 discovery flows.
// Controllers call these methods; routes expose them; responses are DTOs tailored for the API (not raw DB rows).
class CategoriesService {
    constructor() {
        // Acquire the shared Prisma client once per service instance.
        // Avoids creating multiple DB connections and enables graceful shutdown behavior configured in database.js
        this.prisma = createPrismaClient();
    }

    // List categories with pagination and optional search.
    // Supports the UI's first screen where users discover categories and see how many services each category contains.
    // Returns: { items: [...DTOs], pagination: { page, limit, total, pages } }
    async getAllCategories({ page = 1, limit = 20, search } = {}) {
        try {
            // Normalize pagination inputs defensively
            const take = Math.max(1, Number(limit)); // page size
            const skip = (Math.max(1, Number(page)) - 1) * take; // offset

            // If search is provided, build a Prisma "where" filter for name/description (case-insensitive)
            const where = search
                ? {
                    OR: [
                        { name: { contains: String(search), mode: 'insensitive' } },
                        { description: { contains: String(search), mode: 'insensitive' } },
                    ],
                }
                : undefined;

            // Run the data query and a count query in parallel for better latency
            const [rows, total] = await Promise.all([
                this.prisma.category.findMany({
                    where,                                  // optional search filter
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        _count: { select: { services: true } }, // Prisma relation count: number of services per category
                    },
                    orderBy: { name: 'asc' },               // UX-friendly alphabetical sorting
                    skip,                                   // pagination offset
                    take,                                   // page size
                }),
                this.prisma.category.count({ where }),      // total rows matching filter (for pagination UI)
            ]);

            // Map raw rows into stable API DTOs (decoupled from DB schema; adds clarity/consistency to API)
            return {
                items: rows.map(c => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    serviceCount: c._count?.services ?? 0,  // expose related service count as a simple number
                })),
                pagination: {
                    page: Number(page),
                    limit: take,
                    total,
                    pages: Math.max(1, Math.ceil(total / take)),
                },
            };
        } catch (error) {
            // On unexpected failures, surface a consistent operational error for the global error middleware
            // (Optional: log the original error before wrapping for observability)
            throw new AppError('Failed to fetch categories', 500);
        }
    }

    // Fetch a single category by its primary key.
    // Used by UIs that drill down into a category detail before listing services, or for validating selections.
    // Returns: DTO { id, name, slug, description, serviceCount }
    async getCategoryById(id) {
        try {
            // Defensive parsing/validation: ensure IDs are positive integers; otherwise, it's a client error (400)
            const numericId = Number(id);
            if (!Number.isInteger(numericId) || numericId <= 0) {
                throw new AppError('Invalid category id', 400);
            }

            // Query the unique category and include a relation count for services to enrich the detail view
            const category = await this.prisma.category.findUnique({
                where: { id: numericId },
                include: { _count: { select: { services: true } } },
            });

            // Return a clean 404 if not found—important for precise REST semantics and client UX
            if (!category) {
                throw new AppError('Category not found', 404);
            }

            // Shape DB row into the API DTO the frontend expects
            return {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                serviceCount: category._count?.services ?? 0,
            };
        } catch (error) {
            // Preserve known operational errors (400/404) and wrap all other failures as 500
            if (error instanceof AppError) throw error;
            // (Optional: log error for observability)
            throw new AppError('Failed to fetch category', 500);
        }
    }
}

// Export a single service instance for easy consumption by controllers.
// Keeps controllers thin and promotes reuse of the same Prisma client under the hood.
module.exports = new CategoriesService();
