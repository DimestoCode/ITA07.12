import * as React from "react";
import { Component } from "react";
import MainPage from "./pages/mainpage";
import Movies from "./api/movies";
import "./App.css";
import MoviePage from "./pages/moviepage";
import MovieInterface from "./interfaces/movieInterface";

interface AppState {
  movie: MovieInterface;
  movies: MovieInterface[];
  searchedMovies: null | MovieInterface[];
  currentSortType: string;
}
class App extends Component<{}, AppState> {
  state: AppState = {
    movie: Movies[0],
    movies: Movies,
    searchedMovies: null,
    currentSortType: "release date",
  };
  componentDidMount() {
    this.sortMovies(this.state.currentSortType);
  }
  setCurrentSortType = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    const { value: currentSortType } = e.currentTarget;
    if (currentSortType !== this.state.currentSortType) {
      this.sortMovies(currentSortType);
      this.setState({ currentSortType });
    }
  };
  searchMovies = (value: string, category: string): MovieInterface[] => {
    const { movies } = this.state;
    if (category === "title") {
      return movies.filter((movie) =>
        movie.title.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      if (value) {
        return movies.filter((movie) =>
          movie.genres
            .map((genre) => genre.toLocaleLowerCase())
            .includes(value.toLowerCase())
        );
      }
      return movies;
    }
  };
  setSearchedMovies = (searchedMovies: MovieInterface[]) => {
    this.setState({ searchedMovies });
  };
  sortMovies(type: string) {
    const { movies, searchedMovies } = this.state;
    if (type === "release date") {
      if (searchedMovies) {
        this.setState({
          searchedMovies: [...searchedMovies].sort((a, b) => {
            return (
              Number.parseInt(b.release_date) - Number.parseInt(a.release_date)
            );
          }),
        });
      } else {
        this.setState({
          movies: [...movies].sort((a, b) => {
            return (
              Number.parseInt(b.release_date) - Number.parseInt(a.release_date)
            );
          }),
        });
      }
    } else {
      if (searchedMovies) {
        this.setState({
          searchedMovies: [...searchedMovies].sort((a, b) => {
            return b.vote_average - a.vote_average;
          }),
        });
      } else {
        this.setState({
          movies: [
            ...movies.sort((a, b) => {
              return b.vote_average - a.vote_average;
            }),
          ],
        });
      }
    }
  }

  render() {
    const { movies, searchedMovies, currentSortType } = this.state;
    return (
      <>
        <MainPage
          movies={movies}
          searchedMovies={searchedMovies}
          currentSortType={currentSortType}
          setCurrentSortType={this.setCurrentSortType}
          setSearchedMovies={this.setSearchedMovies}
          searchMovies={this.searchMovies}
        />
        {/* <MoviePage movie={Movies[1]} movies={Movies} /> */}
      </>
    );
  }
}

export default App;
