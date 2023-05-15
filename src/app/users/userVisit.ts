import { Entity, IdEntity, remult } from "remult";

@Entity('users_visits', {
    caption: 'ביקורים של מתנדב',
    allowApiCrud: () => remult.authenticated()
})
export class UserVisit extends IdEntity {

}

/*

מתנדב שסיים ביקור בהצלחה נוסף לו 1+ למונה
בכל יצירת רשומת דיווח - יצירת רשומה של חוסר ביקור אצל דייר
דייר שביקרו אצלו יתאפס\ימחק המונה שלו
מי שהמונה 2 ומעלה - שליחת עדכון לראש כולל על חוסר ביקור הדייר פעמיים ומעלה 

*/
