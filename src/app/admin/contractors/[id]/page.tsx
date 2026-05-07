import ContractorForm from './ContractorForm'

export default async function ContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ContractorForm id={id} />
}
