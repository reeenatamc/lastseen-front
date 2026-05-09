import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnalysisRedirect({ params }: Props) {
  const { id } = await params
  redirect(`/es/analysis/${id}`)
}
