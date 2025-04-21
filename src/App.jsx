"use client"

import { useState, useEffect } from "react"
import "./App.css"
import pokeball from "./assets/pokeball.png"
import poke from "./assets/poke.png"
import trainer from "./assets/trainer.png"
import pokedex from "./assets/poked.png"
import pokearena from "./assets/pba_logo.png"
import bg from "./assets/bg.mp3"
import sfx from "./assets/sfx.mp3";
import error from "./assets/error.mp3";
import captured from "./assets/captured.mp3";
import axios from "axios"
import { FaEye, FaBookmark, FaPlus, FaTrash } from 'react-icons/fa';

function App() {
  const [activePage, setActivePage] = useState("landing");
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [team, setTeam] = useState([]);
  const [bgMusic, setBgMusic] = useState(null);
  const [soundType, setSoundType] = useState(null);

  const sounds = {
    sfx,
    error,
    captured,
  };

  function playSound(type) {
    const audioSrc = sounds[type];
    if (!audioSrc) return;
  
    const audio = new Audio(audioSrc);
    audio.volume = 0.6;
    audio.play().catch((err) => console.error("Sound play error:", err));
  }

  useEffect(() => {
    console.log(pokemonList)
    if (soundType) {
      playSound(soundType);
  
      const timer = setTimeout(() => {
        setSoundType(null);
      }, 1000);
  
      return () => clearTimeout(timer);
    }
  }, [pokemonList,soundType])

  const playMusic = () => {
    if (!bgMusic) {
      const music = new Audio(bg);
      music.loop = true;
      music.volume = 0.3;
      music.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
      setBgMusic(music);
    } else {
      bgMusic.play();
    }
  };

  const fetchPokemon = async (page = 1, type = null) => {
    try {
      setLoading(true);
      const limit = 20;
      const offset = (page - 1) * limit;
  
      if (type) {
        const typeRes = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
        const allTypePokemon = typeRes.data.pokemon.map(p => p.pokemon);
  
        const sliced = allTypePokemon.slice(offset, offset + limit);
        const detailedData = await Promise.all(
          sliced.map(async (pokemon) => {
            const details = await axios.get(pokemon.url);
            return details.data;
          })
        );
  
        setPokemonList(detailedData);
      } else {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const pokemonBasicList = res.data.results;
        const detailedData = await Promise.all(
          pokemonBasicList.map(async (pokemon) => {
            const details = await axios.get(pokemon.url);
            return details.data;
          })
        );
        setPokemonList(detailedData);
      }
  
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch Pokémon:", error);
      setLoading(false);
    }
  };

  const handleInputChange = async (value) => {
    setSoundType("sfx")
    setSearchTerm(value);
    setSelectedType(null); 
    
    if (value.trim() === "") {
      fetchPokemon(1);
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=10000`);
      const allPokemon = res.data.results;
  
      const filtered = allPokemon.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
  
      const limited = filtered.slice(0, 20);
      const detailedData = await Promise.all(
        limited.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return details.data;
        })
      );
  
      setPokemonList(detailedData);
      setLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setLoading(false);
    }
  };

  const toggleFilter = () => {
    setShowFilter(prev => !prev);
    setSoundType("sfx")
  };

  const handleTypeFilterClick = (type) => {
    setSoundType("sfx")
    setSearchTerm("");
    setSelectedType(type);
    setCurrentPage(1);
    fetchPokemon(1, type);
  };

  const switchPage = (page) => {
    setSoundType("sfx")
    setActivePage(page)
  }

  const closeModal = () => {
    setSoundType("sfx")
    setShowModal(false);
  };

  const handleTabClick = (tab) => {
    setSoundType("sfx")
    setActiveTab(tab);
  };

  const handleViewClick = async (id) => {
    setSoundType("sfx")
    setIsLoading(true);
    setShowModal(true);
    setSelectedPokemon(null);
  
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
  
      let flavorText = 'Unknown';
      let category = 'Unknown';
      let evolutionDetails = [{
        name: 'Unknown',
        img: 'https://pokestreak.com/question.png'
      }];
  
      try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!speciesRes.ok) throw new Error("Species not found");
  
        const speciesData = await speciesRes.json();
  
        const englishFlavor = speciesData.flavor_text_entries.find(
          entry => entry.language.name === 'en'
        );
  
        const englishCategory = speciesData.genera.find(
          g => g.language.name === 'en'
        );
  
        flavorText = englishFlavor
          ? englishFlavor.flavor_text.replace(/\f/g, ' ')
          : 'Unknown';
  
        category = englishCategory ? englishCategory.genus : 'Unknown';
  
        // Get evolution chain
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evoRes = await fetch(evolutionChainUrl);
        const evoData = await evoRes.json();
  
        function extractEvolutions(chain, evolutions = []) {
          evolutions.push({
            name: chain.species.name,
            url: chain.species.url
          });
          chain.evolves_to.forEach(evo => extractEvolutions(evo, evolutions));
          return evolutions;
        }
  
        const evolutions = extractEvolutions(evoData.chain);
  
        evolutionDetails = await Promise.all(
          evolutions.map(async (evo) => {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}`);
            const pokeData = await pokeRes.json();
            return {
              name: evo.name,
              img: pokeData.sprites.other['official-artwork'].front_default
            };
          })
        );
      } catch (speciesError) {
        console.warn(`Species data not found for Pokémon ${id}`);
      }
  
      // Fetch abilities with descriptions
      const abilitiesWithDescriptions = await Promise.all(
        (data.abilities || []).map(async (ability) => {
          try {
            const abilityRes = await fetch(ability.ability.url);
            const abilityData = await abilityRes.json();
            const abilityDescriptionEntry = abilityData.effect_entries.find(
              entry => entry.language.name === 'en'
            );
  
            return {
              name: ability.ability.name,
              description: abilityDescriptionEntry
                ? abilityDescriptionEntry.short_effect || abilityDescriptionEntry.effect
                : "No description available."
            };
          } catch {
            return {
              name: ability.ability.name,
              description: "No description available."
            };
          }
        })
      );
  
      setSelectedPokemon({
        ...data,
        flavor_text: flavorText,
        category: category,
        abilitiesDetailed: abilitiesWithDescriptions,
        evolutions: evolutionDetails
      });
  
    } catch (error) {
      console.error("Failed to fetch Pokémon data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToTeam = async (id) => {
    
    try {
      const teamRes = await fetch('http://localhost:3001/team');
      const currentTeam = await teamRes.json();
  
      if (currentTeam.length >= 6) {
        setSoundType("error")
        return;
      }
  
      // Fetch full Pokémon data from the API
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
  
      // Check if the Pokémon is already in the team
      const alreadyInTeam = currentTeam.some(poke => poke.id === data.id);
      if (alreadyInTeam) {
        alert(`${data.name} is already in your team!`);
        setSoundType("error")
        return;
      }
  
      // Prepare the simplified data to store
      const newPokemon = {
        id: data.id,
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default,
        type: data.types.map(t => t.type.name),
        stats: data.stats.map(stat => ({
          name: stat.stat.name,
          base: stat.base_stat
        }))
      };
  
      // Save to JSON server
      await fetch('http://localhost:3001/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPokemon)
      });
      setSoundType("captured")
      console.log(`${data.name} added to your team!`);
    } catch (err) {
      console.error("Failed to add to team:", err);
      setSoundType("error")
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch('http://localhost:3001/team');
      const teamData = await res.json();
      setTeam(teamData);
    } catch (error) {
      console.error("Failed to fetch team:", error);
    }
  };

  const removeFromTeam = async (id) => {
    try {
      // Delete from json-server
      await axios.delete(`http://localhost:3001/team/${id}`);
  
      // Remove from local state
      setSoundType("sfx")
      setTeam((prevTeam) => prevTeam.filter((member) => member && member.id !== id));
    } catch (error) {
      setSoundType("error")
      console.error("Error removing Pokémon from team:", error);
    }
  };


  return (
    <>
      <div className="main-cont">
        {showModal && (
          <div className={`poke-modal-overlay ${showModal ? 'active' : ''}`}>
            <div className="poke-modal">
              {selectedPokemon === null || isLoading ? (
                <div className="poke-modal loading">
                  <div className="loader"></div> 
                </div>
              ) : (
                <>
                  <button className="close-button" onClick={closeModal}>×</button>

                  {/* Upper Section */}
                  <div className={`poke-modal-header ${selectedPokemon.types[0].type.name}`}>
                    <div className="poke-details">
                      <div className="dets">
                        <h1>{selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h1>
                        <div className="poke-id">#{String(selectedPokemon.id).padStart(3, '0')}</div>
                        <div className="poke-types-container">
                          {selectedPokemon.types.map((t, idx) => (
                            <span key={idx} className={`poke-type ${t.type.name}`}>{t.type.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className="dets">
                        <div className="poke-category">{selectedPokemon.category}</div>
                        <div className="poke-physical">
                          <div className="physical-stat">
                            <span className="stat-label">Height</span>
                            <span className="stat-value">{selectedPokemon.height / 10} m</span>
                          </div>
                          <div className="physical-stat">
                            <span className="stat-label">Weight</span>
                            <span className="stat-value">{selectedPokemon.weight / 10} kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="poke-image-container">
                      <div className="backpoke">
                        <img className="backpokepic" src={pokeball} alt="" />
                      </div>
                      <img 
                        src={selectedPokemon.sprites.other['official-artwork'].front_default}
                        alt={selectedPokemon.name}
                        className="poke-image"
                      />
                    </div>
                  </div>

                  {/* Tabs Section */}
                  <div className="poke-tabs">
                    <div className="tab-buttons">
                      <button
                        className={`tab-button ${activeTab === "about" ? "active" : ""}`}
                        onClick={() => handleTabClick("about")}
                      >
                        About
                      </button>
                      <button
                        className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
                        onClick={() => handleTabClick("stats")}
                      >
                        Stats
                      </button>
                      <button
                        className={`tab-button ${activeTab === "abilities" ? "active" : ""}`}
                        onClick={() => handleTabClick("abilities")}
                      >
                        Abilities
                      </button>
                      <button
                        className={`tab-button ${activeTab === "evolutions" ? "active" : ""}`}
                        onClick={() => handleTabClick("evolutions")}
                      >
                        Evolutions
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {activeTab === "about" && (
                        <div className="tab-panel active">
                          <div className="about-text">
                            <p>{selectedPokemon?.flavor_text || "No description available."}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === "stats" && (
                        <div className="tab-panel active">
                          <div className="stats-grid">
                            <div className="stat-item">
                              <img src="https://cdn-icons-png.flaticon.com/512/665/665900.png" alt="HP" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[0].base_stat}</span>
                            </div>
                            <div className="stat-item">
                              <img src="https://static.thenounproject.com/png/886706-200.png" alt="Attack" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[1].base_stat}</span>
                            </div>
                            <div className="stat-item">
                              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSItEi53p_1-ssqzZqOiWi_beXRkvdtN3qxw&s" alt="Defense" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[2].base_stat}</span>
                            </div>
                            <div className="stat-item">
                              <img src="https://www.svgrepo.com/show/59702/magic.svg" alt="Sp. Atk" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[3].base_stat}</span>
                            </div>
                            <div className="stat-item">
                              <img src="https://cdn3.iconfinder.com/data/icons/video-game-items-concepts/128/defense-magic-512.png" alt="Sp. Def" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[4].base_stat}</span>
                            </div>
                            <div className="stat-item">
                              <img src="https://cdn3.iconfinder.com/data/icons/basketball-icons/484/Winged_Shoe-512.png" alt="Speed" className="stat-icon" />
                              <span className="stat-value">{selectedPokemon.stats[5].base_stat}</span>
                            </div>
                          </div>
                        </div>
                    )}



                      {activeTab === "abilities" && (
                        <div className="tab-panel active">
                          <div className="ability-cont">
                            {selectedPokemon?.abilitiesDetailed?.map((ability, index) => (
                              <div className="ability" key={index}>
                                <h3>{ability.name}</h3>
                                <p>{ability.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPokemon?.evolutions?.length > 0 ? (
                        <div className="evolution-cont">
                          {selectedPokemon.evolutions.map((evo, idx) => (
                            <div key={idx} className="evolution-box">
                              {evo.img ? (
                                <img src={evo.img} className="evolution-img" />
                              ) : (
                                <div className="evolution-img">No image</div>
                              )}
                              <div className="evolution-name">{evo.name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-evolution-msg">No evolution data available.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}


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

          <button className="start-button" onClick={() => {switchPage("menu"); playMusic()}}>
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
              <button className="menu-button" onClick={() => { switchPage("pokedex"); fetchPokemon(1); }}>
                Pokedex
                <img className="menu-background" style={{filter:"grayscale(100%)"}} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS-JU85QybmyJqmbBFy9uXFaFzBAiPXDkIkw&s" alt="" />
               </button>
              <button className="menu-button" onClick={() => switchPage("battle")}>
                Battle
                <img className="menu-background" src="https://static.thenounproject.com/png/886706-200.png" alt="" />
              </button>
              <button className="menu-button" style={{ padding: "1em" }} onClick={() => {switchPage("myteam");fetchTeam();}}>
                My Team
                <img className="menu-background" src="https://www.pokebeach.com/news/0510/pokemon-black-and-white-starter-pokemon-silhouettes-2.jpg" alt="" />
              </button>
              <button className="menu-button" onClick={() => switchPage("history")}>
                History
                <img className="menu-background" src="https://cdn-icons-png.flaticon.com/512/1016/1016421.png" alt="" />
              </button>
              <button className="menu-button"  onClick={() => switchPage("favorites")}>
                Favorites
                <img className="menu-background" style={{filter:"grayscale(100%)"}} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOBqyAFFvvjOM7mJZllXvBkUY8k2DQE5RAIw&s" alt="" />
              </button>
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
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  onInput={(e) => handleInputChange(e.target.value)}
                />
                <img src={poke} alt="Search" />
              </div>
                <button onClick={toggleFilter}>Filter</button>
                {showFilter && (
                <div className="filter-box">
                  {[
                    "normal", "fire", "water", "electric", "grass", "ice", "fighting",
                    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
                    "dragon", "dark", "steel", "fairy"
                    ].map(type => (
                      <div
                        key={type}
                        className={`filter-type ${type}`}
                        onClick={() => handleTypeFilterClick(type)}
                      >
                      {type}
                    </div>
                  ))}
              </div>
            )}
            </div>
            <div className="poke-cont">
              <div className="pokelist">
                {loading
                  ? [...Array(20)].map((_, index) => (
                      <div className="pokecard loading" key={index}>
                        <div className="loader"></div> 
                      </div>
                    ))
                  : pokemonList.map((pokemon, index) => (
                      <div className={`pokecard ${pokemon.types[0].type.name}`} key={index}>
                        <div className="card-header">
                          <div className="pokename">
                            <div className="card-icons">
                              <button className={`card-btn ${pokemon.types[0].type.name}`} onClick={() => handleViewClick(pokemon.id)}><FaEye /></button>
                              <button className={`card-btn ${pokemon.types[0].type.name}`} onClick={() => addToFavorites(pokemon.id)}><FaBookmark /></button>
                              <button className={`card-btn ${pokemon.types[0].type.name}`} onClick={() => addToTeam(pokemon.id)}><FaPlus /></button>
                            </div>
                            <span className="pokeid">#{pokemon.id}</span>
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
                            <div className="stats"><strong>Sp. Def</strong><p>{pokemon.stats[4].base_stat}</p></div>
                            <div className="stats"><strong>Speed</strong><p>{pokemon.stats[5].base_stat}</p></div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <div className="navigations">
                <div className="paginations">
                  <button onClick={() => currentPage > 1 && fetchPokemon(currentPage - 1, selectedType)}>Prev</button>
                  <span>Page {currentPage}</span>
                  <button onClick={() => fetchPokemon(currentPage + 1, selectedType)}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Pages */}
        <div className={`page ${activePage === "battle" ? "active" : ""}`}>
          
          <div className="pokedex-cont" style={{justifyContent:"space-evenly"}}>
            <img className="poked" src={pokearena} alt="" />
            <div className="battle-choices">
              <button>Vs. AI</button>
              <button>Vs. AI (Group Battle)</button>
              <button>PvP</button>
              <button>PvP (Group Battle)</button>
            </div>
            <button className="back-btn" onClick={() => switchPage("menu")}>Back to Menu</button>

          </div>
        </div>

        <div className={`page ${activePage === "myteam" ? "active" : ""}`}>
          <div className="pokedex-cont">
            <h1 className="page-title" >My Team Page</h1>
            <div className="team-grid">
              {Array.from({ length: 6 }).map((_, index) => {
                const member = team[index];

                return (
                  <div className="main-pokemon" key={index}>
                    {member ? (
                      <>
                        <div className="overlay-remove">
                          <button onClick={() => removeFromTeam(member.id)}>
                            <FaTrash />
                          </button>
                        </div>
                        <div className="teammate">
                          <div className="main-stats">
                            <div className="left-stats">
                              {member.stats && Array.isArray(member.stats) &&
                                member.stats.slice(0, 3).map((stat, i) => {
                                  const statLabels = ['HP', 'A', 'D'];
                                  return (
                                    <div className="wala" key={i}>
                                      <strong>{statLabels[i]}</strong>
                                      <p>{stat.base}</p>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="right-stats">
                              {member.stats && Array.isArray(member.stats) &&
                                member.stats.slice(3).map((stat, i) => {
                                  const statLabels = ['S.A.', 'S.D.', 'S'];
                                  return (
                                    <div className="wala" key={i + 3}>
                                      <strong>{statLabels[i]}</strong>
                                      <p>{stat.base}</p>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          <div className="backpoke">
                            <img className="backpokepic" src={pokeball} alt="" />
                          </div>
                          <img
                            className="teampic"
                            src={member.image}
                            alt={member.name}
                            title={member.name}
                          />
                          <span className="poke-name">{member.name}</span>
                          <div className="subtitles">
                            {member.type && member.type.map((type, index) => (
                              <span
                                className={`subtitle ${type}`}
                                key={index}
                                style={{ padding: "2px", borderRadius: "10px" }}
                              >
                                {type.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="backpoke">
                          <img className="backpokepic" src={pokeball} alt="" />
                        </div>
                        <span className="poke-span">+</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="back-btn" onClick={() => switchPage("menu")}>Back to Menu</button>
          </div>
        </div>

        <div className={`page ${activePage === "history" ? "active" : ""}`}>
          <h1>History Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>

        <div className={`page ${activePage === "favorites" ? "active" : ""}`}>
          <h1>favorites Page</h1>
          <button onClick={() => switchPage("menu")}>Back to Menu</button>
        </div>
      </div>
    </>
  )
}

export default App
