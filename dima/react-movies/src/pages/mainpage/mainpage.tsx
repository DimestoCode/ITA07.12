import React from "react";
import ContentContainer from "../../components/contentContainer";
import Header from "../../components/header";
import SearchBar from "../../components/searchBar";
import MoviesContainer from "../../components/moviesContainer";
import ErrorBoundary from "../../components/errorBoundary";
import MovieInterface from "../../interfaces/movieInterface";
import MoviesResult from "../../components/moviesResult";
import SortFilter from "../../components/sortFilter";
import Footer from "../../components/footer";

import * as QueryString from "query-string";
import { RouteComponentProps } from "react-router-dom";

import "./mainpage.css";
import SortProperty from "../../enums/SortProperty";
import FilterProperty from "../../enums/FilterPropery";
import ParamsToPush from "../../interfaces/paramsToPush";

interface MainPageProps {
  movies: MovieInterface[];
  currentSortType: string;
  loading?: boolean;
  setCurrentSortType: (currentSortType: SortProperty) => void;
  searchMovies: (value: string, category: string) => void;
  setLoading: (Loading: boolean) => void;
  setMovies: (movies: MovieInterface[]) => void;
}

class MainPage extends React.Component<
  MainPageProps & RouteComponentProps<{ searchBy: FilterProperty }>
> {
  componentDidMount() {
    this.props.setLoading(true);
    this.fetchMovies();
  }
  componentDidUpdate(prevProps: MainPageProps & RouteComponentProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.fetchMovies();
    }
  }
  componentWillUnmount(): void {
    this.props.setLoading(true);
  }

  pushParams = (urlParams: ParamsToPush): void => {
    const { history } = this.props;
    history.push({
      pathname: "/search",
      search: QueryString.stringify(urlParams),
    });
  };

  makeFetch = (params: string): void => {
    const { setLoading, setMovies } = this.props;
    fetch(`https://reactjs-cdp.herokuapp.com/movies?${params}`)
      .then((response) => response.json())
      .then((movies) => {
        if (Object.keys(movies).length) {
          setMovies(movies.data);
          setLoading(false);
        } else {
          setMovies([]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  compareSortFromUrlToState = (sortBy: string | string[] | null) =>
    sortBy !== this.props.currentSortType;

  fetchMovies = (): void => {
    let defaultParams = {
      limit: 9,
      sortBy: "release_date",
      sortOrder: "desc",
    };
    const { location, currentSortType } = this.props;
    const { date, rating } = SortProperty;
    const oldParamsObj = QueryString.parse(location.search);
    const { sortBy } = oldParamsObj;
    switch (location.pathname) {
      case "/":
        if (sortBy && this.compareSortFromUrlToState(sortBy))
          this.props.setCurrentSortType(sortBy === date ? date : rating);
        this.makeFetch(QueryString.stringify(defaultParams));
        break;
      case "/search":
        if (sortBy && this.compareSortFromUrlToState(sortBy))
          this.props.setCurrentSortType(sortBy === date ? date : rating);
        this.makeFetch(
          QueryString.stringify({
            ...defaultParams,
            ...oldParamsObj,
            sortBy: oldParamsObj.searchBy
              ? oldParamsObj.searchBy
              : currentSortType,
          })
        );
        break;
    }
  };
  switchCurrentSortType = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    const { location, history, currentSortType } = this.props;
    const oldParam = QueryString.parse(location.search);
    const { value } = e.currentTarget;
    if (
      !oldParam.sortBy ||
      (oldParam.sortBy !== value && currentSortType !== value)
    ) {
      const newParamString = QueryString.stringify({
        ...oldParam,
        sortBy: value,
      });
      history.push({
        pathname: location.pathname,
        search: newParamString,
      });
      this.props.setCurrentSortType(
        value === SortProperty.date ? SortProperty.date : SortProperty.rating
      );
    }
  };

  renderPanel = (): React.ReactNode => {
    const { movies, currentSortType, loading } = this.props;
    return (
      <>
        <ErrorBoundary>
          <MoviesResult movies={movies} loading={loading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <SortFilter
            currentSortType={currentSortType}
            switchCurrentSortType={this.switchCurrentSortType}
          />
        </ErrorBoundary>
      </>
    );
  };

  render() {
    const { movies, loading } = this.props;
    return (
      <div className="app">
        <div className="first-screen-wrapper">
          <ContentContainer>
            <Header />
            <ErrorBoundary>
              <SearchBar
                location={this.props.location}
                pushParams={this.pushParams}
              />
            </ErrorBoundary>
          </ContentContainer>
        </div>
        <div className="second-screen-wrapper">
          <ContentContainer>
            <div className="flex-wrapper">
              {movies?.length !== 0 && this.renderPanel()}
            </div>
          </ContentContainer>
        </div>
        <div className="third-screen-wrapper">
          <ContentContainer>
            <ErrorBoundary>
              <MoviesContainer movies={movies} loading={loading} />
            </ErrorBoundary>
          </ContentContainer>
        </div>
        <Footer />
      </div>
    );
  }
}

export default MainPage;
