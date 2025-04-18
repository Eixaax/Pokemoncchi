"use client"

import { useState, useEffect } from "react"
import "./App.css"
import pokeball from "./assets/pokeball.png"
import poke from "./assets/poke.png"
import trainer from "./assets/trainer.png"
import pokedex from "./assets/poked.png"
import axios from "axios"

function App() {
  const [activePage, setActivePage] = useState("landing")
  const [currentPage, setCurrentPage] = useState(1)
  const [pokemonList, setPokemonList] = useState([]) 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(pokemonList)
  }, [pokemonList])

  const fetchPokemon = async (page = 1) => {
    try {
      setLoading(true); // Start loading
      const limit = 20;
      const offset = (page - 1) * limit;
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const pokemonBasicList = res.data.results;
  
      const detailedData = await Promise.all(
        pokemonBasicList.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return details.data;
        })
      );
  
      setPokemonList(detailedData);
      setCurrentPage(page); // Ensure currentPage updates properly
      setLoading(false); // End loading
    } catch (error) {
      console.error("Failed to fetch Pokémon:", error);
      setLoading(false); // End loading even if there was an error
    }
  }

  const switchPage = (page) => {
    setActivePage(page)
  }

  return (
    <>
      <div className="main-cont">
        <div className="main-cont-overlay">
          <div className="pokeballs">
            <div className="backball1">
              <img src={pokeball} alt="" />
            </div>
            <div className="backball2">
              <img src={pokeball} alt="" />
            </div>
            <div className="backball3">
              <img src={pokeball} alt="" />
            </div>
            <div className="backball4">
              <img src={pokeball} alt="" />
            </div>
          </div>
        </div>

        {/* Landing Page */}
        <div className={`landing-container page ${activePage === "landing" ? "active" : ""}`}>
          <h1 className="title">Pokemon</h1>
          <h1 className="title1"> Gew!</h1>
          <div className="pokemon-image">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
            />
          </div>

          <button className="start-button" onClick={() => switchPage("menu")}>
            Start
          </button>
        </div>

        {/* Menu Page */}
        <div className={`menu-container page ${activePage === "menu" ? "active" : ""}`}>
          <div className="menu-content">
            <div className="background-section">
              <div className="background-image">
                <img src={pokeball} alt="Pokeball Background" />
              </div>
              <div className="trainer">
                <img src={trainer} alt="Trainer" />
              </div>
            </div>

            <div className="menu-grid">
              <button className="menu-button" onClick={() => { switchPage("pokedex"); fetchPokemon(1); }}>Pokedex</button>
              <button className="menu-button" onClick={() => switchPage("battle")}>Battle</button>
              <button className="menu-button" onClick={() => switchPage("myteam")}>My Team</button>
              <button className="menu-button" onClick={() => switchPage("history")}>History</button>
              <button className="menu-button" onClick={() => switchPage("settings")}>Settings</button>
              <button className="menu-button back-button" onClick={() => switchPage("landing")}>
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Pokedex Page */}
        <div className={`page ${activePage === "pokedex" ? "active" : ""}`}>
          <div className="pokedex-cont">
            <img className="poked" src={pokedex} alt="" />
            <div className="poke-nav">
              <button onClick={() => switchPage("menu")}>Back</button>
              <div className="search-box">
                <input type="text" name="" id="" />
                <img src={poke} alt="" />
              </div>
              <button>Filter</button>
            </div>
            <div className="poke-cont">
              <div className="pokelist">
                {loading
                  ? [...Array(20)].map((_, index) => (
                      <div className="pokecard loading" key={index}>
                        <div className="loader"></div> {/* Add a loader here */}
                      </div>
                    ))
                  : pokemonList.map((pokemon, index) => (
                      <div className={`pokecard ${pokemon.types[0].type.name}`} key={index}>
                        <div className="card-header">
                          <div className="pokename">
                            <h1>{pokemon.name}</h1>
                            <div className="subtitles">
                              {pokemon.types.map((t, i) => (
                                <span key={i} className={`subtitle ${t.type.name}`}>
                                  {t.type.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="pokepic">
                          <div className="backpoke">
                            <img className="backpokepic" src={pokeball} alt="" />
                          </div>
                          <img
                            className="frontpokepic"
                            src={pokemon.sprites.other["official-artwork"].front_default}
                            alt={pokemon.name}
                          />
                        </div>
                        <div className="poke-info">
                          <div className="poke-stats">
                            <div className="stats"><strong>HP</strong><p>{pokemon.stats[0].base_stat}</p></div>
                            <div className="stats"><strong>Attack</strong><p>{pokemon.stats[1].base_stat}</p></div>
                            <div className="stats"><strong>Defense</strong><p>{pokemon.stats[2].base_stat}</p></div>
                            <div className="stats"><strong>Sp. Atk</strong><p>{pokemon.stats[3].base_stat}</p></div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <div className="navigations">
                <div className="paginations">
                  <button onClick={() => currentPage > 1 && fetchPokemon(currentPage - 1)}>Prev</button>
                  <span>Page {currentPage}</span>
                  <button onClick={() => fetchPokemon(currentPage + 1)}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Pages */}
        <div className={`page ${activePage === "battle" ? "active" : ""}`}>
          <h1>Battle Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>

        <div className={`page ${activePage === "myteam" ? "active" : ""}`}>
          <h1>My Team Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>

        <div className={`page ${activePage === "history" ? "active" : ""}`}>
          <h1>History Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>

        <div className={`page ${activePage === "settings" ? "active" : ""}`}>
          <h1>Settings Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>
      </div>
    </>
  )
}

export default App
