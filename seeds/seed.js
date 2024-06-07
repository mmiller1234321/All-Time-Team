const teams = [
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
    "Chicago White Sox", "Chicago Cubs", "Cincinnati Reds", "Cleveland Guardians",
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
    "Los Angeles Angels of Anaheim", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers",
    "Minnesota Twins", "New York Yankees", "New York Mets", "Oakland Athletics",
    "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
    "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers",
    "Toronto Blue Jays", "Washington Nationals"
  ];
  
  const stats = ["r", "h", "2b", "3b", "hr", "rbi", "sb", "bb", "ibb"]; // Stats
  
  let insertQuery = `
    INSERT INTO generated_tables 
    (team_name, stat_name, timestamp, user, total_score, positions_filled) 
    VALUES 
  `;
  
  for (let i = 0; i < teams.length; i++) {
    for (let k = 0; k < stats.length; k++) {
      insertQuery += `("${teams[i]}", "${stats[k]}", NULL, NULL, NULL, NULL), `;
    }
  }
  
  // Remove the trailing comma and space
  insertQuery = insertQuery.slice(0, -2);
  
  console.log(insertQuery);
  
