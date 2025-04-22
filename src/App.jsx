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
import { FaArrowLeft, FaArrowRight, FaEye, FaBookmark, FaPlus, FaTrash } from 'react-icons/fa';

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
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [team, setTeam] = useState([]);
  const [teams, setTeams] = useState([]);
  const [bgMusic, setBgMusic] = useState(null);
  const [soundType, setSoundType] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [activeTeam, setActiveTeam] = useState("teams");
  const [activeBattlePage, setActiveBattlePage] = useState("choices");
  const [chosenPokemon, setChosenPokemon] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);



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
      // Fetch all teams
      const teamRes = await fetch('https://json-server-yxws.onrender.com/teams');
      const allTeams = await teamRes.json();
  
      // Find the selected team
      const selectedTeam = allTeams.find(team => team.selected === true);
      if (!selectedTeam) {
        alert("No team is selected.");
        setSoundType("error");
        return;
      }
  
      if (selectedTeam.pokemon.length >= 6) {
        alert("Selected team is already full!");
        setSoundType("error");
        return;
      }
  
      // Fetch Pokémon data
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
  
      // Check for duplicate
      const alreadyInTeam = selectedTeam.pokemon.some(poke => poke.id === data.id);
      if (alreadyInTeam) {
        alert(`${data.name} is already in your team!`);
        setSoundType("error");
        return;
      }
  
      const newPokemon = {
        id: data.id,
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default,
        front:
          data.sprites.versions['generation-v']?.['black-white']?.animated?.front_default ||
          data.sprites.front_default,
        back:
          data.sprites.versions['generation-v']?.['black-white']?.animated?.back_default ||
          data.sprites.back_default,
        type: data.types.map(t => t.type.name),
        stats: data.stats.map(stat => ({
          name: stat.stat.name,
          base: stat.base_stat
        }))
      };
  
      const updatedTeam = {
        ...selectedTeam,
        pokemon: [...selectedTeam.pokemon, newPokemon]
      };
  
      await fetch(`https://https://json-server-yxws.onrender.com/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTeam)
      });
  
      setSoundType("captured");
      console.log(`${data.name} added to ${selectedTeam.name}!`);
    } catch (err) {
      console.error("Failed to add to team:", err);
      setSoundType("error");
    }
  };
  
  

  // const fetchTeam = async () => {
  //   try {
  //     const res = await fetch('http://localhost:3001/team');
  //     const teamData = await res.json();
  //     setTeam(teamData);
  //   } catch (error) {
  //     console.error("Failed to fetch team:", error);
  //   }
  // };

  const fetchTeams = async () => {

    try {
      const response = await fetch("https://json-server-yxws.onrender.com/teams");
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
      console.log("Fetched Teams:", data);
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const removeFromTeam = async (teamId, pokemonId) => {
    try {
      // Get the team first (optional, or use from local state)
      const teamRes = await axios.get(`https://json-server-yxws.onrender.com/teams/${teamId}`);
      const team = teamRes.data;
  
      // Filter out the Pokémon to remove
      const updatedPokemonList = team.pokemon.filter(p => p.id !== pokemonId);
  
      // Update the team with the new Pokémon list
      await axios.patch(`https://json-server-yxws.onrender.com/teams/${teamId}`, {
        pokemon: updatedPokemonList
      });
  
      setSoundType("sfx");
  
      // Update your local state
      setTeam(prev =>
        prev.id === teamId ? { ...prev, pokemon: updatedPokemonList } : prev
      );

    } catch (error) {
      setSoundType("error");
      console.error("Error removing Pokémon from team:", error);
    }
  };
  

  const deleteTeam = async (id) => {
    try {
      await axios.delete(`https://json-server-yxws.onrender.com/teams/${id}`);
  
      setSoundType("sfx");
  
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== id));
    } catch (error) {
      setSoundType("error");
      console.error("Error removing Pokémon from team:", error);
    }
  };

  const confirm = () => {
    console.log("Team Name:", teamName);
  
    const newTeam = {
      name: teamName,
      pokemon: [],
      selected: true 
    };
  
    const deselectPromises = teams.map(team =>
      fetch(`https://json-server-yxws.onrender.com/teams/${team.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ selected: false })
      })
    );
  
    Promise.all(deselectPromises)
      .then(() =>
        fetch("https://json-server-yxws.onrender.com/teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTeam)
        })
      )
      .then(res => res.json())
      .then(data => {
        console.log("Team added:", data);
        setTeams(prev => {
          const updated = prev.map(t => ({ ...t, selected: false }));
          return [...updated, data];
        });
        setShowOverlay(false);
      })
      .catch(err => console.error("Error adding team:", err));
  };
  
  

  const selectTeam = async (id) => {
    try {
      // Deselect all teams in the backend
      const deselectPromises = teams
        .filter(team => team.selected || team.id === id)
        .map(team =>
          axios.patch(`https://json-server-yxws.onrender.com/teams/${team.id}`, {
            selected: team.id === id,
          })
        );
  
      await Promise.all(deselectPromises);
  
      // Update local state
      const updatedTeams = teams.map(team => ({
        ...team,
        selected: team.id === id,
      }));
  
      setTeams(updatedTeams);
      setSoundType("sfx");
    } catch (error) {
      console.error("Error selecting team:", error);
      setSoundType("error");
    }
  };
  

  const viewTeam = async (id) => {
    setActiveTeam("pokemons")

    try {
      // Fetch team data by ID
      const response = await axios.get(`https://json-server-yxws.onrender.com/teams/${id}`);
      
      // Extract the Pokémon from the response
      const teamData = response.data;
      const pokemons = teamData.pokemon;
      setTeam(teamData);
      console.log("Pokémons in the team:", pokemons);
      
    } catch (error) {
      setSoundType("error");
      console.error("Error fetching team data:", error);
    }
  };

  const fetchSelected = async () => {
    setSoundType("sfx");
    try {
  
      const res = await fetch("https://json-server-yxws.onrender.com/teams");
      const teams = await res.json();
  
      const selectedTeams = teams.filter(team => team.selected);
  
      const allPokemon = selectedTeams.flatMap(team => team.pokemon);
  
      if (allPokemon.length === 0) {
        setSoundType("error");
        setChosenPokemon([]); // Optional: clear previously chosen
        console.warn("No Pokémon found in selected teams.");
        return;
      } else{
        setSoundType("sfx");
        setActiveBattlePage("computer1")
      }
  
      console.log("Selected Pokémon:", allPokemon);
      setCurrentIndex(0);
      setChosenPokemon(allPokemon);
  
    } catch (error) {
      console.error("Error fetching selected teams:", error);
      setSoundType("error");
    }
  };
  

  useEffect(() => {
    if (chosenPokemon.length > 0) {
      console.log("Currently chosenPokemon Pokémon:", chosenPokemon[currentIndex]);
    }
  }, [chosenPokemon, currentIndex]);

  const handlePrev = () => {
    setSoundType("sfx");
    setCurrentIndex(prev => {
      const newIndex = (prev - 1 + chosenPokemon.length) % chosenPokemon.length;
      return newIndex;
    });
  };
  
  const handleNext = () => {
    setSoundType("sfx");
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % chosenPokemon.length;
      return newIndex;
    });
  };

  const fight = (arena) => {
    const stats = ["HP", "ATTACK", "DEFENSE", "SP. ATTACK", "SP. DEFENSE", "SPEED"];
  
    const shuffled = stats.sort(() => 0.5 - Math.random());
    const selectedStats = shuffled.slice(0, 3);
  
    console.log("Chosen Stats:", selectedStats);
    if (arena === "computer1") {
      console.log("Fetching 1 random Pokémon");
    
      const maxPokemonId = 1010; // Update this to the latest count when needed
      const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
    
      fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        .then(res => {
          if (!res.ok) throw new Error("Pokémon not found");
          return res.json();
        })
        .then(data => {
          const randomPokemon = {
            id: data.id,
            name: data.name,
            image: {
              front:
                data.sprites.versions['generation-v']['black-white'].animated.front_default ||
                data.sprites.other['official-artwork'].front_default,
              back:
                data.sprites.versions['generation-v']['black-white'].animated.back_default ||
                data.sprites.back_default
            },
            type: data.types.map(t => t.type.name),
            stats: data.stats.map(stat => ({
              name: stat.stat.name,
              base: stat.base_stat
            }))
          };
          console.log("Random Pokémon:", randomPokemon);
          setActiveBattlePage("arena1");
        })
        .catch(err => {
          console.error("Error fetching Pokémon:", err);
        });
    }
     else if (arena === "computer2"){
      console.log("Fetching 6 random pokemons");
    }
  };
  
  

  return (
    <>
      <div className="main-cont">
        {showOverlay && (
          <div className={`create-overlay active`}>
            {/* <div>
              <p>hi</p>
              
            </div> */}
            <div className="walaMaisip">
              <div className="ewan">
                <h1>Enter Team Name</h1>
                <input type="text" placeholder="Team name..." value={teamName} name="" id="" onChange={(e) => setTeamName(e.target.value)}/>
                <div className="buttons">
                  <button style={{backgroundColor:"Green"}} onClick={() => confirm()}>Confirm</button>
                  <button style={{backgroundColor:"red"}} onClick={() => setShowOverlay(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className={`poke-modal-overlay ${showModal ? 'active' : ''}`}>
            <div className="poke-modal">
              {selectedPokemon === null || isLoading ? (
                <div className="poke-modal loading">
                  <img className="loaderbg" src="https://c10.patreonusercontent.com/4/patreon-media/p/campaign/7085984/52d860ed05d54982a1a61ee805c2a720/eyJ3Ijo5NjAsIndlIjoxfQ%3D%3D/8.jpg?token-time=1746316800&token-hash=YG5l6L5LNV0W6Meln9KPqFZCiMvRmJ5m-WnQxr8gj0Y%3D" alt="" />
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
              <button className="menu-button" style={{ padding: "1em" }} onClick={() => {switchPage("myteam"); fetchTeams();}}>
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
                        <img className="loaderbg" src="https://c10.patreonusercontent.com/4/patreon-media/p/campaign/7085984/52d860ed05d54982a1a61ee805c2a720/eyJ3Ijo5NjAsIndlIjoxfQ%3D%3D/8.jpg?token-time=1746316800&token-hash=YG5l6L5LNV0W6Meln9KPqFZCiMvRmJ5m-WnQxr8gj0Y%3D" alt="" />
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
          
          <div className="pokedex-cont" style={{ justifyContent: "space-evenly" }}>
            <div className={`battle-cont ${activeBattlePage === "choices" ? "active" : ""}`}>
              <img className="poked" src={pokearena} alt="" />
              <div className="battle-choices">
                <button onClick={() => fetchSelected()}>
                  Vs. AI
                  <img className="menu-background" src="https://static.thenounproject.com/png/886706-200.png" alt="" />
                </button>
                <button onClick={() => setActiveBattlePage("computer2")}>
                  Vs. AI (Group Battle)
                  <img className="menu-background" src="https://static.thenounproject.com/png/886706-200.png" alt="" />
                </button>
                <button onClick={() => setActiveBattlePage("pvp1")}>
                  PvP
                  <img className="menu-background" src="https://static.thenounproject.com/png/886706-200.png" alt="" />
                </button>
                <button onClick={() => setActiveBattlePage("pvp2")}>
                  PvP (Group Battle)
                  <img className="menu-background" src="https://static.thenounproject.com/png/886706-200.png" alt="" />
                </button>
              </div>
              <button className="back-btn" onClick={() => switchPage("menu")}>Back to Menu</button>
            </div>

            <div className={`battle-cont ${activeBattlePage === "computer1" ? "active" : ""}`}>
              <div className="title-cont">
                <h1>Choose Pokemon</h1>
                <button className="back-btn" onClick={() => setActiveBattlePage("choices")}>Back</button>
              </div>
              <div className="choosing">
                <div className="carousel">
                  {chosenPokemon.length > 0 && (
                    <div className="item">
                      <div className="item-images">
                        <div className="backpoke">
                          <img className="backpokepic" src={pokeball} alt="" />
                        </div>
                        <img src={chosenPokemon[currentIndex].image} alt={chosenPokemon[currentIndex].name} />
                      </div>
                      <div className="item-name">
                        <strong>{chosenPokemon[currentIndex].name}</strong>
                      </div>
                    </div>
                  )}
                <div className="arrows-cont">
                  <button onClick={handlePrev}><FaArrowLeft /></button>
                  <button onClick={handleNext}><FaArrowRight /></button>
                </div>
              </div>

              </div>
              <button className="fight" onClick={() => fight(activeBattlePage)}>Fight</button>
            </div>

            <div className={`battle-cont ${activeBattlePage === "arena1" ? "active" : ""}`}>
              <div className="arena">
                <div className="fighting-pokemon">
                  <div className="the-pokemon">
                    <img src="https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/dialga.png" alt="" />
                  </div>
                  <div className="hud">
                    <strong>Dialga</strong>
                    <div className="health-bar">
                      <div className="health">
                        <p>HP</p>
                        <div className="bar"></div>
                      </div>
                      <p>3/3</p>
                    </div>
                  </div>
                </div>
                <div className="fighting-pokemon you">
                  <div className="the-pokemon">
                    <div className="backpoke">
                      <img className="backpokepic" src={pokeball} alt="pokeball" />
                    </div>
                    <img src="https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/dialga.png" alt="" />
                  </div>
                  <div className="hud you">
                    <strong className="strong you">Dialga</strong>
                    <div className="health-bar.you">
                      <div className="health">
                        <p>HP</p>
                        <div className="bar"></div>
                      </div>
                      <p style={{margin:"0"}}>3/3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`battle-cont ${activeBattlePage === "computer2" ? "active" : ""}`}>
              <h1>computer2</h1>
              <button className="back-btn" onClick={() => setActiveBattlePage("choices")}>Back</button>
            </div>

            <div className={`battle-cont ${activeBattlePage === "pvp1" ? "active" : ""}`}>
              <h1>pvp1</h1>
              <button className="back-btn" onClick={() => setActiveBattlePage("choices")}>Back</button>
            </div>

            <div className={`battle-cont ${activeBattlePage === "pvp2" ? "active" : ""}`}>
              <h1>pvp2</h1>
              <button className="back-btn" onClick={() => setActiveBattlePage("choices")}>Back</button>
            </div>
          </div>
        </div>


        <div className={`page ${activePage === "myteam" ? "active" : ""}`}>
          <div className="pokedex-cont">
            <div className={`team-page ${activeTeam === "teams" ? "active" : ""}`}>
              <h1>My Teams Page</h1>
              <div className="poke-nav">
                <button onClick={() => switchPage("menu")}>Back</button>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search Team..."
                    onInput={(e) => handleInputChange(e.target.value)}
                  />
                  <img src={poke} alt="Search" />
                </div>
                <button onClick={() => setShowOverlay(true)}>Create</button>
              </div>
              <div className="poke-cont">
                <div className="pokelist">
                  {[...teams]
                    .sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0))
                    .map((team) => (
                      <div
                        key={team.id}
                        className="pokecard"
                        style={{
                          border: team.selected ? "5px dashed red" : "2px dashed #8a2be2",
                          backgroundColor: "rgba(88, 28, 135, 0.3)",
                        }}
                      >
                        <div className="pokecard-overlay">
                          <button onClick={() => selectTeam(team.id)}>Select Team</button>
                          <button onClick={() => viewTeam(team.id)}>View Team</button>
                          <button onClick={() => deleteTeam(team.id)}>Delete Team</button>
                        </div>
                        <h1 className="teamName">{team.name}</h1>
                        <div className="teamcard">
                          {Array.from({ length: 6 }).map((_, index) => {
                            const pokemon = team.pokemon[index];
                            return (
                              <div key={index} className="box">
                                <div className="backpoke">
                                  <img className="backpokepic" src={pokeball} alt="pokeball" />
                                </div>
                                {pokemon ? (
                                  <img src={pokemon.front} alt={pokemon.name} />
                                ) : (
                                  <span className="poke-span">+</span>
                                )}
                              </div>
                            );
                          })}
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

            {/* Single Team Page */}
            <div className={`team-page ${activeTeam !== "teams" ? "active" : ""}`}>
              <h1 className="page-title">My Team Page</h1>
              <div className="team-grid">
                {Array.from({ length: 6 }).map((_, index) => {
                  const member = team.pokemon && team.pokemon[index];
                  return (
                    <div className="main-pokemon" key={index}>
                      {member ? (
                        <>
                          <div className="overlay-remove">
                            <button onClick={() => removeFromTeam(team.id, member.id)}>
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
                            <img className="teampic" src={member.front} alt={member.name} title={member.name} />
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
              <button className="back-btn" onClick={() => {
                setActiveTeam("teams");
                fetchTeams();
              }}>Back to Teams</button>
            </div>
          </div>
        </div>
        <div className={`page ${activePage === "history" ? "active" : ""}`}>
          <div className="pokedex-cont">
          <button className="back-btn" onClick={() => {
                setActiveTeam("teams");
                fetchTeams();
              }}>Back to Teams</button>
          </div>
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
