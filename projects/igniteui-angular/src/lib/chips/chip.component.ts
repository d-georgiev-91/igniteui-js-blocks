﻿import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    Input,
    Output,
    ViewChild,
    AfterViewInit,
    Renderer2
} from '@angular/core';
import { DisplayDensity } from '../core/utils';
import {
    IgxDragDirective,
    IDragBaseEventArgs,
    IDragStartEventArgs,
    IgxDropEnterEventArgs,
    IgxDropEventArgs
} from '../directives/dragdrop/dragdrop.directive';


export interface IBaseChipEventArgs {
    originalEvent: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent | IgxDropEnterEventArgs;
    owner: IgxChipComponent;
}

export interface IChipClickEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
}

export interface IChipKeyDownEventArgs extends IBaseChipEventArgs {
    originalEvent: KeyboardEvent;
    cancel: boolean;
}

export interface IChipEnterDragAreaEventArgs extends IBaseChipEventArgs {
    dragChip: IgxChipComponent;
}

export interface IChipSelectEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
    selected: boolean;
}

let CHIP_ID = 0;

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html'
})
export class IgxChipComponent implements AfterViewInit {

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-chip [id]="'igx-chip-1'"></igx-chip>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-chip-${CHIP_ID++}`;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be dragged in order to change it's position.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true"></igx-chip>
     * ```
     */
    @Input()
    public draggable = false;

    /**
     * An @Input property that defines if the `IgxChipComponent` should render remove button and throw remove events.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true" [removable]="true"></igx-chip>
     * ```
     */
    @Input()
    public removable = false;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be selected on click or through navigation,
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="chip.id" [draggable]="true" [removable]="true" [selectable]="true"></igx-chip>
     * ```
     */
    @Input()
    public selectable = false;

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-chip--cosy';
            case DisplayDensity.compact:
                return 'igx-chip--compact';
            default:
                return 'igx-chip';
        }
    }

    /**
     * An @Input property that defines if the `IgxChipComponent` is disabled.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="chip.id" [disabled]="true"></igx-chip>
     * ```
     */
    @HostBinding('class.igx-chip--disabled')
    @Input()
    public disabled = false;

    /**
     * Returns the `IgxChipComponent` theme.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     *     ngAfterViewInit(){
     *     let chipTheme = this.chip.displayDensity;
     * }
     * ```
     */
    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    /**
     * An @Input property that sets the `IgxChipComponent` theme.
     * Available options are `compact`, `cosy`, `comfortable`.
     * The default theme is `comfortable`.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [displayDensity]="'compact'"></igx-chip>
     * ```
     */
    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
    }

    /**
     * An @Input property that sets the `IgxChipComponent` background color.
     * The `color` property supports string, rgb, hex.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [color]="'#ff0000'"></igx-chip>
     * ```
     */
    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    /**
     * Returns the background color of the `IgxChipComponent`.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * ngAfterViewInit(){
     *     let chipColor = this.chip.color;
     * }
     * ```
     */
    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    /**
     * Emits an event when the `IgxChipComponent` moving starts.
     * Returns the moving `IgxChipComponent`.
     * ```typescript
     * moveStarted(event: IBaseChipEventArgs){
     *     let movingChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveStart)="moveStarted($event)">
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` moving ends.
     * Returns the moved `IgxChipComponent`.
     * ```typescript
     * moveEnded(event: IBaseChipEventArgs){
     *     let movedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveEnd)="moveEnded($event)">
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is removed.
     * Returns the removed `IgxChipComponent`.
     * ```typescript
     * remove(event: IBaseChipEventArgs){
     *     let removedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onRemove)="remove($event)">
     * ```
     */
    @Output()
    public onRemove = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is clicked.
     * Returns the clicked `IgxChipComponent`, whether the event should be canceled.
     * ```typescript
     * chipClick(event: IChipClickEventArgs){
     *     let clickedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onClick)="chipClick($event)">
     * ```
     */
    @Output()
    public onClick = new EventEmitter<IChipClickEventArgs>();

    /**
     * Emits event when the `IgxChipComponent` is selected/deselected.
     * Returns the selected chip reference, whether the event should be canceled, what is the next selection state and
     * when the event is triggered by interaction `originalEvent` is provided, otherwise `originalEvent` is `null`.
     * ```typescript
     * chipSelect(event: IChipSelectEventArgs){
     *     let selectedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onSelection)="chipSelect($event)">
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<IChipSelectEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` keyboard navigation is being used.
     * Returns the focused/selected `IgxChipComponent`, whether the event should be canceled,
     * if the `alt`, `shift` or `control` key is pressed and the pressed key name.
     * ```typescript
     * chipKeyDown(event: IChipKeyDownEventArgs){
     *     let keyDown = event.key;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onKeyDown)="chipKeyDown($event)">
     * ```
     */
    @Output()
    public onKeyDown = new EventEmitter<IChipKeyDownEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` has entered the `IgxChipsAreaComponent`.
     * Returns the target `IgxChipComponent`, the drag `IgxChipComponent`, as  well as
     * the original drop event arguments.
     * ```typescript
     * chipEnter(event: IChipEnterDragAreaEventArgs){
     *     let targetChip = event.targetChip;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onDragEnter)="chipEnter($event)">
     * ```
     */
    @Output()
    public onDragEnter = new EventEmitter<IChipEnterDragAreaEventArgs>();

    /**
     * @hidden
     */
    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('chipArea', { read: IgxDragDirective })
    public dragDir: IgxDragDirective;

    /**
     * @hidden
     */
    @ViewChild('removeBtn', { read: ElementRef })
    public removeBtn: ElementRef;

    /**
     * @hidden
     */
    public get ghostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-chip__ghost--cosy';
            case DisplayDensity.compact:
                return 'igx-chip__ghost--compact';
            default:
                return 'igx-chip__ghost';
        }
    }

    /**
     * Returns if the `IgxChipComponent` is selected.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * selectedChip(){
     *     let selectedChip = this.chip.selected;
     * }
     * ```
     */
    @Input()
    public get selected() {
        return this._selected;
    }

    /**
     * Sets the `IgxChipComponent` to be selected.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" [selected]="true">
     * ```
     */
    public set selected(newValue: boolean) {
        this.changeSelection(newValue);
    }

    /**
     * Returns if the `IgxChipComponent` is the last one among its siblings.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * ngAfterViewInit(){
     *     let lastChip = this.chip.isLastChip;
     * }
     * ```
     */
    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    /**
     * @hidden
     */
    public chipTabindex = 0;
    public removeBtnTabindex = 0;
    public areaMovingPerforming = false;

    private _displayDensity = DisplayDensity.comfortable;
    private _selected = false;
    private _dragging = false;
    private _selectedItemClass = 'igx-chip__item--selected';
    private _movedWhileRemoving = false;

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        this.chipArea.nativeElement.addEventListener('keydown', (args) => {
            this.onChipKeyDown(args);
        });
        if (this.removable) {
            this.removeBtn.nativeElement.addEventListener('keydown', (args) => {
                this.onRemoveBtnKeyDown(args);
            });
        }
    }

    /**
     * @hidden
     */
    public onChipKeyDown(event: KeyboardEvent) {
        const keyDownArgs: IChipKeyDownEventArgs = {
            originalEvent: event,
            owner: this,
            cancel: false
        };

        this.onKeyDown.emit(keyDownArgs);
        if (keyDownArgs.cancel) {
            return;
        }

        if ((event.key === 'Delete' || event.key === 'Del') && this.removable) {
            this.onRemove.emit({
                originalEvent: event,
                owner: this
            });
        }

        if ((event.key === ' ' || event.key === 'Spacebar') && this.selectable) {
            this.changeSelection(!this.selected, event);
        }

        if (event.key !== 'Tab') {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    public onRemoveBtnKeyDown(event: KeyboardEvent) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            this.onRemove.emit({
                originalEvent: event,
                owner: this
            });

            event.preventDefault();
            event.stopPropagation();
        }
    }

    public onChipRemoveMouseDown(event: PointerEvent|MouseEvent) {
        event.stopPropagation();
    }

    /**
     * @hidden
     */
    public onChipRemove(event: MouseEvent | TouchEvent) {
        this.onRemove.emit({
            originalEvent: event,
            owner: this
        });
    }

    /**
     * @hidden
     */
    public onChipRemoveMove() {
        // We don't remove chip if user starting touch interacting on the remove button moves the chip
        this._movedWhileRemoving = true;
    }

    /**
     * @hidden
     */
    public onChipRemoveEnd(event: TouchEvent) {
        if (!this._movedWhileRemoving) {
            this.onChipRemove(event);
        }
        this._movedWhileRemoving = false;
    }

    protected changeSelection(newValue: boolean, srcEvent = null) {
        const onSelectArgs: IChipSelectEventArgs = {
            originalEvent: srcEvent,
            owner: this,
            selected: false,
            cancel: false
        };

        if (newValue && !this._selected) {
            onSelectArgs.selected = true;
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.addClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        } else if (!newValue && this._selected) {
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.removeClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        }
    }

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrag behaviour
    public onChipDragStart(event: IDragStartEventArgs) {
        this.onMoveStart.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
        event.cancel = !this.draggable;
        this._dragging = true;
    }

    /**
     * @hidden
     */
    public onChipDragEnd() {
        this.dragDir.dropFinished();
        this._dragging = false;
    }

    /**
     * @hidden
     */
    public onChipMoveEnd(event: IDragBaseEventArgs) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.onMoveEnd.emit({
            originalEvent: event.originalEvent,
            owner: this
        });

        if (this.selected) {
            this.chipArea.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public onChipDragClicked(event: IDragBaseEventArgs) {
        const clickEventArgs: IChipClickEventArgs = {
            originalEvent: event.originalEvent,
            owner: this,
            cancel: false
        };
        this.onClick.emit(clickEventArgs);

        if (!clickEventArgs.cancel && this.selectable) {
            this.changeSelection(!this.selected, event.originalEvent);
        }
    }
    // End chip igxDrag behaviour

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrop behaviour
    public onChipDragEnterHandler(event: IgxDropEnterEventArgs) {
        if (this.dragDir === event.drag || !event.dragData || !event.dragData.chip) {
            return;
        }

        const eventArgs: IChipEnterDragAreaEventArgs = {
            owner: this,
            dragChip: event.dragData.chip,
            originalEvent: event
        };
        this.onDragEnter.emit(eventArgs);
    }

    /**
     * @hidden
     */
    public onChipDrop(event: IgxDropEventArgs) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behaviour
}