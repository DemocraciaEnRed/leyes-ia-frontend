<script setup lang="ts">
interface RawProjectContent {
	objective?: string
	justification?: string
	key_changes?: string
	impact_on_society?: string
}

interface RawProject {
	id: number
	slug: string
	name?: string | null
	title?: string | null
	description?: string | null
	summary?: string | null
	category?: string | null
	authorFullname?: string | null
	publishedAt?: string | null
	imageUrl?: string | null
	coverImage?: string | null
	content?: RawProjectContent | string | null
	proposed_questions?: string[] | string | null
}

const route = useRoute()

const projectSlug = computed(() => {
	const slug = route.params.projectSlug

	if (Array.isArray(slug)) {
		return slug[0] || ''
	}

	return (slug as string) || ''
})

const { data: response, status, error, refresh } = await useFetch<{ project: RawProject }>(
	() => `/api/backend/hub/projects/slug/${projectSlug.value}`,
	{
		watch: [projectSlug]
	}
)

const project = computed(() => response.value?.project || null)

const parseMaybeJson = <T>(value: unknown, fallback: T): T => {
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value) as T
			return parsed ?? fallback
		} catch {
			return fallback
		}
	}

	if (value && typeof value === 'object') {
		return value as T
	}

	return fallback
}

const normalizedContent = computed<RawProjectContent>(() => {
	return parseMaybeJson<RawProjectContent>(project.value?.content, {})
})

const proposedQuestions = computed<string[]>(() => {
	const parsed = parseMaybeJson<unknown>(project.value?.proposed_questions, [])
	if (!Array.isArray(parsed)) {
		return []
	}

	return parsed.filter((question): question is string => typeof question === 'string' && question.trim().length > 0)
})

const summary = computed(() => {
	const projectSummary = project.value?.summary?.trim()
	if (projectSummary) {
		return projectSummary
	}

	const fallbackDescription = project.value?.description?.trim()
	if (fallbackDescription) {
		return fallbackDescription
	}

	return 'Este proyecto todavía no cuenta con un resumen disponible.'
})

const projectTitle = computed(() => {
	return project.value?.title || project.value?.name || 'Proyecto de ley'
})
</script>

<template>
	<NuxtLayout name="default">
		<ProjectDetailHero
			v-if="status === 'success' && project"
			:project="project"
		/>

		<UContainer class="max-w-5xl py-10 space-y-8">
			<UProgress v-if="status === 'pending'" indeterminate class="my-4" />

			<UAlert
				v-else-if="status === 'error'"
				color="error"
				variant="subtle"
				icon="lucide:alert-circle"
				title="No pudimos cargar este proyecto"
				:description="error?.message || 'Intentá nuevamente en unos minutos.'"
				:actions="[
					{
						icon: 'lucide:refresh-cw',
						label: 'Refrescar',
						color: 'neutral',
						variant: 'outline',
						onClick: () => refresh()
					}
				]"
			/>

			<UEmpty
				v-else-if="!project"
				icon="lucide:file-x"
				title="Proyecto no disponible"
				description="Este proyecto no existe o no está publicado."
				class="mx-auto"
			/>

			<template v-else>
				<ProjectDetailSummarySection :summary="summary" />
				<USeparator icon="lucide:sparkles" class="my-2" />
				<ProjectDetailFeatureGrid :content="normalizedContent" />
				<USeparator icon="lucide:messages-square" class="my-2" />
				<ProjectDetailQuestionsSection :questions="proposedQuestions" />
				<USeparator icon="lucide:megaphone" class="my-2" />
				<ProjectDetailCTA :project-title="projectTitle" />
			</template>
		</UContainer>
	</NuxtLayout>
</template>