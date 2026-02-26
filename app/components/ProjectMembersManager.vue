<script setup lang="ts">
interface MemberUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  imageUrl?: string | null
}

interface ProjectMember {
  id: number
  projectId: number
  userId: number
  projectRole: 'owner' | 'manager' | 'supporter'
  user: MemberUser
}

interface MemberCandidate {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  imageUrl?: string | null
  alreadyMember: boolean
  currentProjectRole: 'owner' | 'manager' | 'supporter' | null
}

const props = defineProps<{
  projectId: string
  canManage: boolean
}>()

const toast = useToast()

const members = ref<ProjectMember[]>([])
const candidates = ref<MemberCandidate[]>([])
const loadingMembers = ref(false)
const searchingCandidates = ref(false)
const mutating = ref(false)
const searchText = ref('')
const memberFilter = ref<'all' | 'manager' | 'supporter'>('all')

const confirmModalOpen = ref(false)
const pendingAction = ref<{
  type: 'role-change' | 'remove'
  memberId: number
  memberName: string
  nextRole?: 'manager' | 'supporter'
} | null>(null)

const fullName = (user?: MemberUser | MemberCandidate | null) => {
  if (!user) {
    return 'Usuario'
  }
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
}

const roleBadgeColor = (role: string) => {
  if (role === 'owner') return 'primary'
  if (role === 'manager') return 'info'
  if (role === 'supporter') return 'warning'
  return 'neutral'
}

const filteredMembers = computed(() => {
  if (memberFilter.value === 'all') {
    return members.value
  }

  return members.value.filter(member => member.projectRole === memberFilter.value)
})

const membersCount = computed(() => members.value.length)
const managersCount = computed(() => members.value.filter(member => member.projectRole === 'manager').length)
const supportersCount = computed(() => members.value.filter(member => member.projectRole === 'supporter').length)

const fetchMembers = async () => {
  loadingMembers.value = true
  try {
    const response = await $authFetch<{ members: ProjectMember[] }>(`/api/backend/projects/${props.projectId}/manage/members`, {
      method: 'GET'
    })
    members.value = response.members || []
  } catch (error: any) {
    toast.add({
      title: 'No pudimos cargar miembros',
      description: error?.data?.message || error?.message || 'Error inesperado',
      color: 'error'
    })
  } finally {
    loadingMembers.value = false
  }
}

const searchCandidates = async () => {
  if (!props.canManage) {
    return
  }

  searchingCandidates.value = true
  try {
    const response = await $authFetch<{ candidates: MemberCandidate[] }>(`/api/backend/projects/${props.projectId}/manage/member-candidates`, {
      method: 'GET',
      query: {
        search: searchText.value,
        limit: 12
      }
    })
    candidates.value = response.candidates || []
  } catch (error: any) {
    toast.add({
      title: 'No pudimos buscar usuarios',
      description: error?.data?.message || error?.message || 'Error inesperado',
      color: 'error'
    })
  } finally {
    searchingCandidates.value = false
  }
}

const addMember = async (userId: number, projectRole: 'manager' | 'supporter') => {
  mutating.value = true
  try {
    await $authFetch(`/api/backend/projects/${props.projectId}/manage/members`, {
      method: 'POST',
      body: {
        userId,
        projectRole
      }
    })

    toast.add({
      title: 'Miembro agregado',
      description: `El usuario fue agregado como ${projectRole}.`,
      color: 'success'
    })

    await Promise.all([fetchMembers(), searchCandidates()])
  } catch (error: any) {
    toast.add({
      title: 'No se pudo agregar el miembro',
      description: error?.data?.message || error?.message || 'Error inesperado',
      color: 'error'
    })
  } finally {
    mutating.value = false
  }
}

const updateMemberRole = async (memberId: number, nextRole: 'manager' | 'supporter') => {
  mutating.value = true
  try {
    await $authFetch(`/api/backend/projects/${props.projectId}/manage/members/${memberId}`, {
      method: 'PATCH',
      body: {
        projectRole: nextRole
      }
    })

    toast.add({
      title: 'Rol actualizado',
      description: `El miembro ahora es ${nextRole}.`,
      color: 'success'
    })

    await Promise.all([fetchMembers(), searchCandidates()])
  } catch (error: any) {
    toast.add({
      title: 'No se pudo actualizar el rol',
      description: error?.data?.message || error?.message || 'Error inesperado',
      color: 'error'
    })
  } finally {
    mutating.value = false
  }
}

const removeMember = async (memberId: number) => {
  mutating.value = true
  try {
    await $authFetch(`/api/backend/projects/${props.projectId}/manage/members/${memberId}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Miembro removido',
      description: 'El usuario fue removido del proyecto.',
      color: 'success'
    })

    await Promise.all([fetchMembers(), searchCandidates()])
  } catch (error: any) {
    toast.add({
      title: 'No se pudo remover el miembro',
      description: error?.data?.message || error?.message || 'Error inesperado',
      color: 'error'
    })
  } finally {
    mutating.value = false
  }
}

const askRoleChange = (member: ProjectMember, nextRole: 'manager' | 'supporter') => {
  pendingAction.value = {
    type: 'role-change',
    memberId: member.id,
    memberName: fullName(member.user),
    nextRole
  }
  confirmModalOpen.value = true
}

const askRemoveMember = (member: ProjectMember) => {
  pendingAction.value = {
    type: 'remove',
    memberId: member.id,
    memberName: fullName(member.user)
  }
  confirmModalOpen.value = true
}

const confirmActionTitle = computed(() => {
  if (!pendingAction.value) {
    return 'Confirmar acción'
  }

  if (pendingAction.value.type === 'remove') {
    return '¿Remover miembro?'
  }

  return '¿Cambiar rol del miembro?'
})

const confirmActionDescription = computed(() => {
  if (!pendingAction.value) {
    return ''
  }

  if (pendingAction.value.type === 'remove') {
    return `${pendingAction.value.memberName} será removido del proyecto.`
  }

  return `${pendingAction.value.memberName} pasará a ser ${pendingAction.value.nextRole}.`
})

const closeConfirmModal = () => {
  if (mutating.value) {
    return
  }

  confirmModalOpen.value = false
  pendingAction.value = null
}

const executeConfirmedAction = async () => {
  if (!pendingAction.value) {
    return
  }

  const action = pendingAction.value

  if (action.type === 'remove') {
    await removeMember(action.memberId)
  } else if (action.nextRole) {
    await updateMemberRole(action.memberId, action.nextRole)
  }

  confirmModalOpen.value = false
  pendingAction.value = null
}

watch(() => props.projectId, async () => {
  await fetchMembers()
  if (props.canManage) {
    await searchCandidates()
  }
}, { immediate: true })
</script>

<template>
  <UPageCard
    variant="outline"
    class="bg-elevated"
  >
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 class="text-lg font-semibold">
            Miembros del proyecto
          </h3>
          <p class="text-sm text-muted">
            Gestioná owner, manager y supporter.
          </p>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          icon="lucide:refresh-cw"
          :loading="loadingMembers"
          @click="fetchMembers"
        >
          Refrescar
        </UButton>
      </div>

      <UProgress
        v-if="loadingMembers"
        animation="swing"
      />

      <UAlert
        v-if="!canManage"
        color="neutral"
        variant="subtle"
        icon="lucide:shield-check"
        title="Acceso de solo lectura"
        description="Podés ver miembros, pero no administrar cambios de roles en este proyecto."
      />

      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            :color="memberFilter === 'all' ? 'primary' : 'neutral'"
            :variant="memberFilter === 'all' ? 'solid' : 'outline'"
            @click="memberFilter = 'all'"
          >
            Todos ({{ membersCount }})
          </UButton>
          <UButton
            size="xs"
            :color="memberFilter === 'manager' ? 'info' : 'neutral'"
            :variant="memberFilter === 'manager' ? 'solid' : 'outline'"
            @click="memberFilter = 'manager'"
          >
            Managers ({{ managersCount }})
          </UButton>
          <UButton
            size="xs"
            :color="memberFilter === 'supporter' ? 'warning' : 'neutral'"
            :variant="memberFilter === 'supporter' ? 'solid' : 'outline'"
            @click="memberFilter = 'supporter'"
          >
            Supporters ({{ supportersCount }})
          </UButton>
        </div>

        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="rounded-lg border border-default p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <p class="font-medium">
              {{ fullName(member.user) }}
            </p>
            <p class="text-sm text-muted">
              {{ member.user.email }} · rol sistema: {{ member.user.role }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :color="roleBadgeColor(member.projectRole)"
              variant="subtle"
            >
              {{ member.projectRole }}
            </UBadge>

            <template v-if="canManage && member.projectRole !== 'owner'">
              <UButton
                v-if="member.projectRole !== 'manager'"
                size="xs"
                color="info"
                variant="soft"
                :loading="mutating"
                @click="askRoleChange(member, 'manager')"
              >
                Hacer manager
              </UButton>

              <UButton
                v-if="member.projectRole !== 'supporter'"
                size="xs"
                color="warning"
                variant="soft"
                :loading="mutating"
                @click="askRoleChange(member, 'supporter')"
              >
                Hacer supporter
              </UButton>

              <UButton
                size="xs"
                color="error"
                variant="soft"
                :loading="mutating"
                @click="askRemoveMember(member)"
              >
                Remover
              </UButton>
            </template>
          </div>
        </div>

        <UEmpty
          v-if="!loadingMembers && filteredMembers.length === 0"
          icon="lucide:users"
          title="Sin miembros"
          description="No hay miembros para el filtro seleccionado."
        />
      </div>

      <div
        v-if="canManage"
        class="pt-2 border-t border-default space-y-3"
      >
        <h4 class="font-medium">
          Agregar miembros
        </h4>

        <div class="flex flex-col md:flex-row gap-2">
          <UInput
            v-model="searchText"
            placeholder="Buscar por nombre o email"
            class="w-full"
            @keyup.enter="searchCandidates"
          />
          <UButton
            color="primary"
            icon="lucide:search"
            :loading="searchingCandidates"
            @click="searchCandidates"
          >
            Buscar
          </UButton>
        </div>

        <div class="space-y-2">
          <div
            v-for="candidate in candidates"
            :key="candidate.id"
            class="rounded-lg border border-default p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <p class="font-medium">
                {{ fullName(candidate) }}
              </p>
              <p class="text-sm text-muted">
                {{ candidate.email }} · rol sistema: {{ candidate.role }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                v-if="candidate.alreadyMember"
                color="neutral"
                variant="subtle"
              >
                Ya es {{ candidate.currentProjectRole }}
              </UBadge>

              <template v-else>
                <UButton
                  size="xs"
                  color="info"
                  variant="soft"
                  :loading="mutating"
                  @click="addMember(candidate.id, 'manager')"
                >
                  Agregar manager
                </UButton>

                <UButton
                  v-if="candidate.role === 'legislator'"
                  size="xs"
                  color="warning"
                  variant="soft"
                  :loading="mutating"
                  @click="addMember(candidate.id, 'supporter')"
                >
                  Agregar supporter
                </UButton>
              </template>
            </div>
          </div>

          <UEmpty
            v-if="!searchingCandidates && candidates.length === 0"
            icon="lucide:user-search"
            title="Sin resultados"
            description="Probá con otro nombre o correo para invitar miembros."
          />
        </div>
      </div>
    </div>
  </UPageCard>

  <UModal
    v-model:open="confirmModalOpen"
    :dismissible="!mutating"
    :title="confirmActionTitle"
    :description="confirmActionDescription"
  >
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="mutating"
          @click="closeConfirmModal"
        >
          Cancelar
        </UButton>
        <UButton
          color="primary"
          :loading="mutating"
          :disabled="mutating"
          @click="executeConfirmedAction"
        >
          Confirmar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
