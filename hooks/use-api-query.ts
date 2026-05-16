import React from 'react';

type QueryState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useApiQuery<T>(queryFn: () => Promise<T>, queryKey = 'default') {
  const [state, setState] = React.useState<QueryState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const queryFnRef = React.useRef(queryFn);

  queryFnRef.current = queryFn;

  const load = React.useCallback(async () => {
    setState((currentState) => ({ ...currentState, error: null, loading: true }));

    try {
      const data = await queryFnRef.current();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
        loading: false,
      });
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      setState((currentState) => ({ ...currentState, error: null, loading: true }));

      try {
        const data = await queryFnRef.current();

        if (active) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (active) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : 'Erro ao carregar dados',
            loading: false,
          });
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [queryKey]);

  return {
    ...state,
    refetch: load,
  };
}
