import {CrudState, Dictionary, EntityCrudSelectors, EntityCrudState, FilterMetadata, ICriteria, OptResponse} from './models';
import {createSelector, MemoizedSelector} from '@ngrx/store';
import {jNgrxFilter} from './j-ngrx-filter';

export function createCrudSelectorsFactory<T>(adapter) {

  function getCrudSelectors<V>(
    selectState: (state: V) => EntityCrudState<T>
  ): EntityCrudSelectors<T, V>;
  function getCrudSelectors<V>(
    selectState: (state: V) => EntityCrudState<T>
  ): EntityCrudSelectors<T, V> {

    const getError = (state: CrudState<T>): any => state.error;
    const getIsLoading = (state: CrudState<T>): boolean => state.isLoading;
    const getIsLoaded = (state: CrudState<T>): boolean => state.isLoaded;
    const getFilters = (state: CrudState<T>): { [s: string]: FilterMetadata; } => state.filters;
    const getLastCriteria = (state: CrudState<T>): ICriteria => state.lastCriteria;
    const getItemSelected = (state: CrudState<T>): T => state.itemSelected;
    const getIdSelected = (state: CrudState<T>): string | number => state.idSelected;
    const getItemsSelected = (state: CrudState<T>): T[] => state.itemsSelected;
    const getIdsSelected = (state: CrudState<T>): string[] | number[] => state.idsSelected;
    const getRespones = (state: CrudState<T>): OptResponse<T>[] => state.responses;

    const selectError: MemoizedSelector<V, any> = createSelector(selectState, getError);
    const selectIsLoading: MemoizedSelector<V, boolean> = createSelector(selectState, getIsLoading);
    const selectIsLoaded: MemoizedSelector<V, boolean> = createSelector(selectState, getIsLoaded);
    const selectFilters: MemoizedSelector<V, { [s: string]: FilterMetadata; }> = createSelector(
      selectState,
      getFilters
    );
    const selectLastCriteria: MemoizedSelector<V, ICriteria> = createSelector(selectState, getLastCriteria);

    const selectItemSelected: MemoizedSelector<V, T> = createSelector(selectState, getItemSelected);
    const selectItemsSelected: MemoizedSelector<V, T[]> = createSelector(selectState, getItemsSelected);

    const selectIdSelected: MemoizedSelector<V, string | number> = createSelector(selectState, getIdSelected);
    const selectIdsSelected: MemoizedSelector<V, string[] | number[]> = createSelector(selectState, getIdsSelected);

    const selectResponses: MemoizedSelector<V, OptResponse<T>[]> = createSelector(selectState, getRespones);

    const {
      selectAll,
      selectEntities,
      selectIds,
      selectTotal
    } = adapter.getSelectors(selectState);

    const selectItemsSelectedOrigin = createSelector(
      selectIdsSelected,
      selectEntities,
      (ids: any[], entities: Dictionary<T>): any =>
        ids.map((id: any) => (entities[id] as T))
    );

    const selectItemSelectedOrigin = createSelector(
      selectIdSelected,
      selectEntities,
      (id, entities: Dictionary<T>): any => entities[id]
    );

    const selectFilteredItems: MemoizedSelector<any, T[]> = createSelector([selectAll, selectFilters],
      (allTasks: T[], filters: { [s: string]: FilterMetadata; }): T[] => {
        return jNgrxFilter<T>(allTasks, filters);
      }
    );

    return {
      selectError,
      selectIsLoading,
      selectIsLoaded,
      selectFilters,
      selectFilteredItems,
      selectAll,
      selectEntities,
      selectIds,
      selectTotal,
      selectLastCriteria,
      selectIdSelected,
      selectItemSelected,
      selectItemSelectedOrigin,
      selectIdsSelected,
      selectItemsSelected,
      selectItemsSelectedOrigin,
      selectResponses,
    };
  }

  return {getCrudSelectors};
}
