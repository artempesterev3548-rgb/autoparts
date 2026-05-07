import ServiceOrderForm from './ServiceOrderForm'

export default async function ServiceOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string; phone?: string; linked?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  return <ServiceOrderForm id={id} name={sp.name} phone={sp.phone} linked={sp.linked} />
}
