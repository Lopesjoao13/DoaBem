import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { ROLE_LABELS, ROLES } from '@/constants/roles.js'
import { TONES } from '@/constants/tones.js'
import { USER_MESSAGES } from '@/constants/userMessages.js'
import { useUserForm } from '@/hooks/useUserForm.js'

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }))
const SELECT_ROLE = { value: '', label: 'Selecione o perfil' }

export const UserDialog = ({ user, isSelf, onClose, onSaved }) => {
    const formId = useId()
    const form = useUserForm({ user, onSaved })
    const { values, errors } = form

    return (
        <Dialog
            isOpen
            title={user ? 'Editar usuário' : 'Novo usuário'}
            description={user ? undefined : USER_MESSAGES.newUserNotice}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Salvando...' : 'Salvar usuário'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                {isSelf && <Callout tone={TONES.INFO}>{USER_MESSAGES.selfNotice}</Callout>}
                <FormField
                    label="Nome"
                    id={`${formId}-name`}
                    name="name"
                    value={values.name}
                    onChange={form.handleChange}
                    error={errors.name}
                    autoFocus
                />
                <FormField
                    label="E-mail (login)"
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={form.handleChange}
                    error={errors.email}
                />
                {!user && (
                    <FormField
                        label="Senha inicial"
                        id={`${formId}-password`}
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={values.password}
                        onChange={form.handleChange}
                        error={errors.password}
                        hint="Entre 8 e 72 caracteres."
                    />
                )}
                <Field label="Perfil" htmlFor={`${formId}-role`} error={errors.role}>
                    <Select
                        id={`${formId}-role`}
                        name="role"
                        value={values.role}
                        onChange={form.handleChange}
                        options={ROLE_OPTIONS}
                        placeholder={SELECT_ROLE}
                        error={errors.role}
                        disabled={isSelf}
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
