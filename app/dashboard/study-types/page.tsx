import ModelManager from '@/src/components/medical/ModelManager';
export default function StudyTypesPage() {
  return <ModelManager endpoint="/api/study-types" fields={["categoryId","name","description"]} title="Study Types" />;
}
