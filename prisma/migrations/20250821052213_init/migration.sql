-- CreateEnum
CREATE TYPE "public"."CloudProvider" AS ENUM ('AWS', 'Azure', 'GCP', 'Other');

-- CreateEnum
CREATE TYPE "public"."MappingType" AS ENUM ('DIRECT', 'COMPOSITE', 'PARTIAL', 'NO_EQUIVALENCE');

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cloud_provider" "public"."CloudProvider" NOT NULL,
    "description" TEXT,
    "features" JSONB,
    "documentation_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mappings" (
    "id" SERIAL NOT NULL,
    "mapping_type" "public"."MappingType" NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "caveats" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source_service_id" INTEGER NOT NULL,
    "target_service_id" INTEGER NOT NULL,

    CONSTRAINT "mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "services_cloud_provider_idx" ON "public"."services"("cloud_provider");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "public"."services"("category_id");

-- CreateIndex
CREATE INDEX "services_is_active_idx" ON "public"."services"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_cloud_provider_key" ON "public"."services"("name", "cloud_provider");

-- CreateIndex
CREATE INDEX "mappings_source_service_id_idx" ON "public"."mappings"("source_service_id");

-- CreateIndex
CREATE INDEX "mappings_target_service_id_idx" ON "public"."mappings"("target_service_id");

-- CreateIndex
CREATE INDEX "mappings_is_active_idx" ON "public"."mappings"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "mappings_source_service_id_target_service_id_key" ON "public"."mappings"("source_service_id", "target_service_id");

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mappings" ADD CONSTRAINT "mappings_source_service_id_fkey" FOREIGN KEY ("source_service_id") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mappings" ADD CONSTRAINT "mappings_target_service_id_fkey" FOREIGN KEY ("target_service_id") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
