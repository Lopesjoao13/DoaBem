import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { TONES } from '@/constants/tones.js'
import { USER_MESSAGES } from '@/pages/users/constants/userMessages.js'
import { useUserForm } from '@/pages/users/hooks/useUserForm.js'
import { getDescribedBy } from '@/utils/a11y.js'
import { ROLE_OPTIONS, SELECT_ROLE } from '@/pages/users/constants/userOptions.js'
import { FIELD_LIMITS } from '@/constants/fieldLimits.js'

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
                    <Button variant="outline" family="deny" onClick={onClose}>
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
                <Field
                    maxLength={FIELD_LIMITS.USER_NAME}
                    length={values.name.length}
                    label="Nome"
                    htmlFor={`${formId}-name`}
                    error={errors.name}
                >
                    <Input
                        id={`${formId}-name`}
                        error={errors.name}
                        aria-describedby={getDescribedBy(`${formId}-name`, { error: errors.name })}
                        maxLength={FIELD_LIMITS.USER_NAME}
                        name="name"
                        value={values.name}
                        onChange={form.handleChange}
                        autoFocus
                    />
                </Field>
                <Field
                    maxLength={FIELD_LIMITS.USER_EMAIL}
                    length={values.email.length}
                    label="E-mail (login)"
                    htmlFor={`${formId}-email`}
                    error={errors.email}
                >
                    <Input
                        id={`${formId}-email`}
                        error={errors.email}
                        aria-describedby={getDescribedBy(`${formId}-email`, {
                            error: errors.email,
                        })}
                        maxLength={FIELD_LIMITS.USER_EMAIL}
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={form.handleChange}
                    />
                </Field>
                {!user && (
                    <Field
                        maxLength={FIELD_LIMITS.USER_PASSWORD}
                        length={values.password.length}
                        label="Senha inicial"
                        htmlFor={`${formId}-password`}
                        hint="Entre 8 e 72 caracteres."
                        error={errors.password}
                    >
                        <Input
                            id={`${formId}-password`}
                            error={errors.password}
                            aria-describedby={getDescribedBy(`${formId}-password`, {
                                error: errors.password,
                                hint: 'Entre 8 e 72 caracteres.',
                            })}
                            maxLength={FIELD_LIMITS.USER_PASSWORD}
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={values.password}
                            onChange={form.handleChange}
                        />
                    </Field>
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
