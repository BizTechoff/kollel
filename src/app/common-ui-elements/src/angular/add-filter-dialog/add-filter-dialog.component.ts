import { Component } from '@angular/core';



import { MatDialogRef } from '@angular/material/dialog';


@Component({
    templateUrl: './add-filter-dialog.component.html'
})
export class SelectValueDialogComponent {
    constructor(private dialog: MatDialogRef<any>) {


    }
    searchString = '';
    selectFirst() {
        for (const o of this.values) {
            if (this.matchesFilter(o)) {
                this.select(o);
                return;
            }
        }
    }
    matchesFilter(o: { caption?: string }) {
        return o.caption!.toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase());
    }

    /*internal*/
    values!: { caption?: string }[];
    /*internal*/
    allowAdd!:boolean
    /*internal*/
    title!: string;
    /*internal*/
    onSelect!: (selected: { caption?: string }) => void;
    /*internal*/
    onAdd!: (add: { caption?: string }) => void;


    args<T extends { caption?: string }>(args: {
        allowAdd?: boolean
        values: T[],
        onSelect: (selected: T) => void,
        onAdd?: (add: T) => void,
        title?: string
    }) {
        this.allowAdd = args.allowAdd as boolean
        this.values = args.values;
        this.onSelect = args.onSelect as any;
        this.onAdd = args.onAdd as any;
        this.title = args.title!;
    }

    select(x: { caption?: string }) {
        this.onSelect(x);
        this.dialog.close();
    }

    add() {
        if (this.onAdd) {
            this.onAdd({ caption: this.searchString })
            this.dialog.close();
        }
    }
}
