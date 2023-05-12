import { Entity, Field, Fields, IdEntity, remult } from "remult";
import { User } from "../users/user";
import { Tenant } from "./tenant";

@Entity('tenants_volunteers', {
    caption: 'מתנדבים לדייר',
    allowApiCrud: () => remult.authenticated()
})
export class TenantVolunteer extends IdEntity {

    @Field<TenantVolunteer, Tenant>(() => Tenant, {
        caption: 'דייר'
    })
    tenant!: Tenant

    @Field<TenantVolunteer, User>(() => User, {
        caption: 'מתנדב'
    })
    volunteer!: User

    @Fields.number<TenantVolunteer>({caption: 'מידת ההתמדה חודשית'})
    persistenceMonthly = 0

    @Fields.number<TenantVolunteer>({caption: 'מידת ההתמדה שנתית'})
    persistenceYearly = 0

}
