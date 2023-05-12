import { Entity, Field, Fields, IdEntity, isBackend, remult } from "remult";
import { User } from "../users/user";
import { Visit } from "./visit";

@Entity<VisitVolunteer>('visits_volunteers', {
    caption: 'מתנדבים בביקור',
    allowApiCrud: () => remult.authenticated(),
    saving: async row => {
        if (isBackend()) {
            if (row.isNew()) {
                row.created = new Date()
                row.createdBy = remult.user?.id!
            }
            else {
                row.modified = new Date()
                row.modifiedBy = remult.user?.id!
            }
        }
    }
})
export class VisitVolunteer extends IdEntity {

    @Field<VisitVolunteer, Visit>(() => Visit, {
        caption: 'ביקור'
    })
    visit!: Visit

    @Field<VisitVolunteer, User>(() => User, {
        caption: 'מתנדב'
    })
    volunteer!: User

    @Fields.date<VisitVolunteer>({
        allowApiUpdate: false
    })
    created = new Date();

    @Fields.date<VisitVolunteer>({
        allowApiUpdate: false
    })
    modified = new Date();

    @Fields.uuid<VisitVolunteer>({
        allowApiUpdate: false
    })
    createdBy = ''

    @Fields.uuid<VisitVolunteer>({
        allowApiUpdate: false
    })
    modifiedBy = ''
    
}
 