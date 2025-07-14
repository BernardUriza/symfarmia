import ModelManager from '@/src/components/medical/ModelManager';
export default function CategoriesPage() {
  return <ModelManager endpoint="/api/categories" fields={["name"]} title="Categories" />;
}
