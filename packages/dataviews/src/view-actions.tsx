/**
 * External dependencies
 */
import type { ChangeEvent } from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';
import { cog } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { unlock } from './lock-unlock';
import { SORTING_DIRECTIONS, sortLabels } from './constants';
import { VIEW_LAYOUTS } from './layouts';
import type { NormalizedField, View } from './types';

const {
	DropdownMenuV2: DropdownMenu,
	DropdownMenuGroupV2: DropdownMenuGroup,
	DropdownMenuItemV2: DropdownMenuItem,
	DropdownMenuRadioItemV2: DropdownMenuRadioItem,
	DropdownMenuCheckboxItemV2: DropdownMenuCheckboxItem,
	DropdownMenuItemLabelV2: DropdownMenuItemLabel,
} = unlock( componentsPrivateApis );

interface ViewTypeMenuProps {
	view: View;
	onChangeView: ( view: View ) => void;
	supportedLayouts?: string[];
}

interface PageSizeMenuProps {
	view: View;
	onChangeView: ( view: View ) => void;
}

interface FieldsVisibilityMenuProps< Item > {
	view: View;
	onChangeView: ( view: View ) => void;
	fields: NormalizedField< Item >[];
}

interface SortMenuProps< Item > {
	fields: NormalizedField< Item >[];
	view: View;
	onChangeView: ( view: View ) => void;
}

interface ViewActionsProps< Item > {
	fields: NormalizedField< Item >[];
	view: View;
	onChangeView: ( view: View ) => void;
	supportedLayouts?: string[];
}

function ViewTypeMenu( {
	view,
	onChangeView,
	supportedLayouts,
}: ViewTypeMenuProps ) {
	let _availableViews = VIEW_LAYOUTS;
	if ( supportedLayouts ) {
		_availableViews = _availableViews.filter( ( _view ) =>
			supportedLayouts.includes( _view.type )
		);
	}
	if ( _availableViews.length === 1 ) {
		return null;
	}
	const activeView = _availableViews.find( ( v ) => view.type === v.type );
	return (
		<DropdownMenu
			trigger={
				<DropdownMenuItem
					suffix={
						<span aria-hidden="true">{ activeView?.label }</span>
					}
				>
					<DropdownMenuItemLabel>
						{ __( 'Layout' ) }
					</DropdownMenuItemLabel>
				</DropdownMenuItem>
			}
		>
			{ _availableViews.map( ( availableView ) => {
				return (
					<DropdownMenuRadioItem
						key={ availableView.type }
						value={ availableView.type }
						name="view-actions-available-view"
						checked={ availableView.type === view.type }
						hideOnClick
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
							switch ( e.target.value ) {
								case 'list':
								case 'grid':
								case 'table':
									return onChangeView( {
										...view,
										type: e.target.value,
										layout: {},
									} );
							}
							throw new Error( 'Invalid dataview' );
						} }
					>
						<DropdownMenuItemLabel>
							{ availableView.label }
						</DropdownMenuItemLabel>
					</DropdownMenuRadioItem>
				);
			} ) }
		</DropdownMenu>
	);
}

const PAGE_SIZE_VALUES = [ 10, 20, 50, 100 ];
function PageSizeMenu( { view, onChangeView }: PageSizeMenuProps ) {
	return (
		<DropdownMenu
			trigger={
				<DropdownMenuItem
					suffix={ <span aria-hidden="true">{ view.perPage }</span> }
				>
					<DropdownMenuItemLabel>
						{ __( 'Items per page' ) }
					</DropdownMenuItemLabel>
				</DropdownMenuItem>
			}
		>
			{ PAGE_SIZE_VALUES.map( ( size ) => {
				return (
					<DropdownMenuRadioItem
						key={ size }
						value={ size }
						name="view-actions-page-size"
						checked={ view.perPage === size }
						onChange={ () => {
							onChangeView( {
								...view,
								// `e.target.value` holds the same value as `size` but as a string,
								// so we use `size` directly to avoid parsing to int.
								perPage: size,
								page: 1,
							} );
						} }
					>
						<DropdownMenuItemLabel>{ size }</DropdownMenuItemLabel>
					</DropdownMenuRadioItem>
				);
			} ) }
		</DropdownMenu>
	);
}

function FieldsVisibilityMenu< Item >( {
	view,
	onChangeView,
	fields,
}: FieldsVisibilityMenuProps< Item > ) {
	const hidableFields = fields.filter(
		( field ) =>
			field.enableHiding !== false && field.id !== view.layout.mediaField
	);
	if ( ! hidableFields?.length ) {
		return null;
	}
	return (
		<DropdownMenu
			trigger={
				<DropdownMenuItem>
					<DropdownMenuItemLabel>
						{ __( 'Fields' ) }
					</DropdownMenuItemLabel>
				</DropdownMenuItem>
			}
		>
			{ hidableFields?.map( ( field ) => {
				return (
					<DropdownMenuCheckboxItem
						key={ field.id }
						value={ field.id }
						checked={ ! view.hiddenFields?.includes( field.id ) }
						onChange={ () => {
							onChangeView( {
								...view,
								hiddenFields: view.hiddenFields?.includes(
									field.id
								)
									? view.hiddenFields.filter(
											( id ) => id !== field.id
									  )
									: [
											...( view.hiddenFields || [] ),
											field.id,
									  ],
							} );
						} }
					>
						<DropdownMenuItemLabel>
							{ field.header }
						</DropdownMenuItemLabel>
					</DropdownMenuCheckboxItem>
				);
			} ) }
		</DropdownMenu>
	);
}

function SortMenu< Item >( {
	fields,
	view,
	onChangeView,
}: SortMenuProps< Item > ) {
	const sortableFields = fields.filter(
		( field ) => field.enableSorting !== false
	);
	if ( ! sortableFields?.length ) {
		return null;
	}
	const currentSortedField = fields.find(
		( field ) => field.id === view.sort?.field
	);
	return (
		<DropdownMenu
			trigger={
				<DropdownMenuItem
					suffix={
						<span aria-hidden="true">
							{ currentSortedField?.header }
						</span>
					}
				>
					<DropdownMenuItemLabel>
						{ __( 'Sort by' ) }
					</DropdownMenuItemLabel>
				</DropdownMenuItem>
			}
		>
			{ sortableFields?.map( ( field ) => {
				const sortedDirection = view.sort?.direction;
				return (
					<DropdownMenu
						key={ field.id }
						trigger={
							<DropdownMenuItem>
								<DropdownMenuItemLabel>
									{ field.header }
								</DropdownMenuItemLabel>
							</DropdownMenuItem>
						}
						style={ {
							minWidth: '220px',
						} }
					>
						{ SORTING_DIRECTIONS.map( ( direction ) => {
							const isChecked =
								currentSortedField !== undefined &&
								sortedDirection === direction &&
								field.id === currentSortedField.id;

							const value = `${ field.id }-${ direction }`;

							return (
								<DropdownMenuRadioItem
									key={ value }
									// All sorting radio items share the same name, so that
									// selecting a sorting option automatically deselects the
									// previously selected one, even if it is displayed in
									// another submenu. The field and direction are passed via
									// the `value` prop.
									name="view-actions-sorting"
									value={ value }
									checked={ isChecked }
									onChange={ () => {
										onChangeView( {
											...view,
											sort: {
												field: field.id,
												direction,
											},
										} );
									} }
								>
									<DropdownMenuItemLabel>
										{ sortLabels[ direction ] }
									</DropdownMenuItemLabel>
								</DropdownMenuRadioItem>
							);
						} ) }
					</DropdownMenu>
				);
			} ) }
		</DropdownMenu>
	);
}

function _ViewActions< Item >( {
	fields,
	view,
	onChangeView,
	supportedLayouts,
}: ViewActionsProps< Item > ) {
	return (
		<DropdownMenu
			trigger={
				<Button
					size="compact"
					icon={ cog }
					label={ __( 'View options' ) }
				/>
			}
		>
			<DropdownMenuGroup>
				<ViewTypeMenu
					view={ view }
					onChangeView={ onChangeView }
					supportedLayouts={ supportedLayouts }
				/>
				<SortMenu
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
				/>
				<FieldsVisibilityMenu
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
				/>
				<PageSizeMenu view={ view } onChangeView={ onChangeView } />
			</DropdownMenuGroup>
		</DropdownMenu>
	);
}

// A type assertion is used here to keep the type argument.
const ViewActions = memo( _ViewActions ) as typeof _ViewActions;

export default ViewActions;
