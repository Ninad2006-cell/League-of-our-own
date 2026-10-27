/**
 * Real-World Cricket Team Rosters Database & Dynamic Squad Generator
 * Covers International, Domestic (Ranji, Sheffield Shield, Ford Trophy),
 * WBBL Women's teams, and regional associate teams.
 */

export const TEAM_ROSTERS = {
  // -------------------------------------------------------------
  // INTERNATIONAL MEN
  // -------------------------------------------------------------
  'india': [
    { name: 'R. Sharma', role: 'batter', style: 'RHB', captain: true },
    { name: 'S. Gill', role: 'batter', style: 'RHB' },
    { name: 'V. Kohli', role: 'batter', style: 'RHB' },
    { name: 'S. Iyer', role: 'batter', style: 'RHB' },
    { name: 'R. Pant', role: 'wicketkeeper', style: 'LHB' },
    { name: 'H. Pandya', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'R. Jadeja', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'A. Patel', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'K. Yadav', role: 'bowler', style: 'Wrist Spin' },
    { name: 'J. Bumrah', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Siraj', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'india a': [
    { name: 'A. Easwaran', role: 'batter', style: 'RHB', captain: true },
    { name: 'R. Gaikwad', role: 'batter', style: 'RHB' },
    { name: 'B. Sai Sudharsan', role: 'batter', style: 'LHB' },
    { name: 'D. Padikkal', role: 'batter', style: 'LHB' },
    { name: 'D. Jurel', role: 'wicketkeeper', style: 'RHB' },
    { name: 'N. Rana', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'T. Kotian', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'M. Suthar', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'P. Krishna', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'K. Ahmed', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'N. Saini', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'australia': [
    { name: 'T. Head', role: 'batter', style: 'LHB' },
    { name: 'D. Warner', role: 'batter', style: 'LHB' },
    { name: 'M. Marsh', role: 'allrounder', style: 'RHB/Medium', captain: true },
    { name: 'S. Smith', role: 'batter', style: 'RHB' },
    { name: 'G. Maxwell', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'M. Stoinis', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'J. Inglis', role: 'wicketkeeper', style: 'RHB' },
    { name: 'P. Cummins', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Starc', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'A. Zampa', role: 'bowler', style: 'Legbreak' },
    { name: 'J. Hazlewood', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'australia a': [
    { name: 'N. McSweeney', role: 'batter', style: 'RHB', captain: true },
    { name: 'M. Harris', role: 'batter', style: 'LHB' },
    { name: 'C. Bancroft', role: 'batter', style: 'RHB' },
    { name: 'O. Davies', role: 'batter', style: 'RHB' },
    { name: 'B. Webster', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'J. Peirson', role: 'wicketkeeper', style: 'RHB' },
    { name: 'M. Neser', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'X. Bartlett', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Boland', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'T. Murphy', role: 'bowler', style: 'Offbreak' },
    { name: 'B. Doggett', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'england': [
    { name: 'P. Salt', role: 'batter', style: 'RHB' },
    { name: 'J. Buttler', role: 'wicketkeeper', style: 'RHB', captain: true },
    { name: 'W. Jacks', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'H. Brook', role: 'batter', style: 'RHB' },
    { name: 'J. Bairstow', role: 'batter', style: 'RHB' },
    { name: 'L. Livingstone', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'S. Curran', role: 'allrounder', style: 'LHB/Left-arm Medium' },
    { name: 'J. Archer', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'A. Rashid', role: 'bowler', style: 'Legbreak' },
    { name: 'M. Wood', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Topley', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'england lions': [
    { name: 'D. Mousley', role: 'allrounder', style: 'LHB/Spin', captain: true },
    { name: 'T. Banton', role: 'batter', style: 'RHB' },
    { name: 'J. Cox', role: 'batter', style: 'RHB' },
    { name: 'J. Rew', role: 'wicketkeeper', style: 'LHB' },
    { name: 'O. Price', role: 'batter', style: 'RHB' },
    { name: 'Z. Chappell', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'P. Brown', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Potts', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'D. Baker', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'J. Carson', role: 'bowler', style: 'Offbreak' },
    { name: 'H. Moore', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'south africa': [
    { name: 'Q. de Kock', role: 'wicketkeeper', style: 'LHB' },
    { name: 'R. Hendricks', role: 'batter', style: 'RHB' },
    { name: 'A. Markram', role: 'batter', style: 'RHB', captain: true },
    { name: 'H. Klaasen', role: 'batter', style: 'RHB' },
    { name: 'D. Miller', role: 'batter', style: 'LHB' },
    { name: 'T. Stubbs', role: 'batter', style: 'RHB' },
    { name: 'M. Jansen', role: 'allrounder', style: 'RHB/Left-arm Fast' },
    { name: 'K. Maharaj', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'K. Rabada', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'A. Nortje', role: 'bowler', style: 'Right-arm Express' },
    { name: 'O. Baartman', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'pakistan': [
    { name: 'M. Rizwan', role: 'wicketkeeper', style: 'RHB' },
    { name: 'B. Azam', role: 'batter', style: 'RHB', captain: true },
    { name: 'S. Ayub', role: 'batter', style: 'LHB' },
    { name: 'F. Zaman', role: 'batter', style: 'LHB' },
    { name: 'S. Khan', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'I. Ahmed', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'I. Wasim', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'S. Afridi', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'N. Shah', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'H. Rauf', role: 'bowler', style: 'Right-arm Express' },
    { name: 'M. Amir', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'new zealand': [
    { name: 'D. Conway', role: 'wicketkeeper', style: 'LHB' },
    { name: 'F. Allen', role: 'batter', style: 'RHB' },
    { name: 'K. Williamson', role: 'batter', style: 'RHB', captain: true },
    { name: 'D. Mitchell', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'G. Phillips', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'M. Chapman', role: 'batter', style: 'LHB' },
    { name: 'M. Santner', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'T. Southee', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Henry', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Ferguson', role: 'bowler', style: 'Right-arm Express' },
    { name: 'T. Boult', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'new zealand a': [
    { name: 'R. Ravindra', role: 'allrounder', style: 'LHB/Spin', captain: true },
    { name: 'N. Kelly', role: 'batter', style: 'LHB' },
    { name: 'C. Bowes', role: 'batter', style: 'RHB' },
    { name: 'J. Carter', role: 'batter', style: 'RHB' },
    { name: 'M. Hay', role: 'wicketkeeper', style: 'RHB' },
    { name: 'S. Solia', role: 'allrounder', style: 'LHB/Medium' },
    { name: 'A. Patel', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'L. Delport', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'M. Fisher', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'W. O\'Rourke', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. Lister', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'west indies': [
    { name: 'B. King', role: 'batter', style: 'RHB' },
    { name: 'J. Charles', role: 'batter', style: 'RHB' },
    { name: 'N. Pooran', role: 'wicketkeeper', style: 'LHB' },
    { name: 'R. Powell', role: 'batter', style: 'RHB', captain: true },
    { name: 'S. Rutherford', role: 'batter', style: 'LHB' },
    { name: 'A. Russell', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'R. Shepherd', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'A. Hosein', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'A. Joseph', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'G. Motie', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'S. Joseph', role: 'bowler', style: 'Right-arm Express' }
  ],
  'west indies a': [
    { name: 'K. Wickham', role: 'batter', style: 'LHB' },
    { name: 'T. Chanderpaul', role: 'batter', style: 'LHB' },
    { name: 'A. Athanaze', role: 'batter', style: 'LHB', captain: true },
    { name: 'K. Hodge', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'T. Imlach', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Sinclair', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'S. Springer', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'J. Warrican', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'M. Clarke', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'A. Phillip', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'O. Shields', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'sri lanka': [
    { name: 'P. Nissanka', role: 'batter', style: 'RHB' },
    { name: 'K. Mendis', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Perera', role: 'batter', style: 'LHB' },
    { name: 'C. Asalanka', role: 'batter', style: 'LHB', captain: true },
    { name: 'D. de Silva', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'D. Shanaka', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'W. Hasaranga', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'M. Theekshana', role: 'bowler', style: 'Mystery Spin' },
    { name: 'M. Pathirana', role: 'bowler', style: 'Right-arm Slinger' },
    { name: 'D. Madushanka', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'N. Thushara', role: 'bowler', style: 'Right-arm Slinger' }
  ],
  'bangladesh': [
    { name: 'L. Das', role: 'wicketkeeper', style: 'RHB' },
    { name: 'T. Hasan', role: 'batter', style: 'LHB' },
    { name: 'N. Hossain Shanto', role: 'batter', style: 'LHB', captain: true },
    { name: 'T. Hridoy', role: 'batter', style: 'RHB' },
    { name: 'S. Al Hasan', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'Mahmudullah', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'J. Ali', role: 'batter', style: 'RHB' },
    { name: 'M. Hasan Miraz', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'R. Hossain', role: 'bowler', style: 'Legbreak' },
    { name: 'T. Ahmed', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Rahman', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'afghanistan': [
    { name: 'R. Gurbaz', role: 'wicketkeeper', style: 'RHB' },
    { name: 'I. Zadran', role: 'batter', style: 'RHB' },
    { name: 'G. Naib', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'A. Omarzai', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'M. Nabi', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'N. Zadran', role: 'batter', style: 'LHB' },
    { name: 'K. Janat', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'R. Khan', role: 'bowler', style: 'Legbreak', captain: true },
    { name: 'N. Ahmad', role: 'bowler', style: 'Left-arm Wrist Spin' },
    { name: 'F. Farooqi', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'N. Ul Haq', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'ireland': [
    { name: 'P. Stirling', role: 'batter', style: 'RHB', captain: true },
    { name: 'A. Balbirnie', role: 'batter', style: 'RHB' },
    { name: 'L. Tucker', role: 'wicketkeeper', style: 'RHB' },
    { name: 'H. Tector', role: 'batter', style: 'RHB' },
    { name: 'C. Campher', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'G. Dockrell', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'M. Adair', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. McCarthy', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'C. Young', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Little', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'B. White', role: 'bowler', style: 'Legbreak' }
  ],
  'zimbabwe': [
    { name: 'T. Marumani', role: 'batter', style: 'LHB' },
    { name: 'B. Bennett', role: 'batter', style: 'RHB' },
    { name: 'C. Ervine', role: 'batter', style: 'LHB', captain: true },
    { name: 'S. Williams', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'S. Raza', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'R. Burl', role: 'allrounder', style: 'LHB/Legbreak' },
    { name: 'C. Madande', role: 'wicketkeeper', style: 'RHB' },
    { name: 'W. Masakadza', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'B. Muzarabani', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Ngarava', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'T. Chatara', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'namibia': [
    { name: 'J. Kotze', role: 'batter', style: 'RHB' },
    { name: 'M. van Lingen', role: 'batter', style: 'LHB' },
    { name: 'J. Frylinck', role: 'allrounder', style: 'LHB/Left-arm Medium' },
    { name: 'G. Erasmus', role: 'allrounder', style: 'RHB/Offbreak', captain: true },
    { name: 'J. J. Smit', role: 'allrounder', style: 'RHB/Left-arm Fast' },
    { name: 'D. Wiese', role: 'allrounder', style: 'RHB/Right-arm Fast' },
    { name: 'Z. Green', role: 'wicketkeeper', style: 'RHB' },
    { name: 'R. Trumpelmann', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'B. Scholtz', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'T. Lungameni', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'J. Brassell', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'netherlands': [
    { name: 'M. O\'Dowd', role: 'batter', style: 'RHB' },
    { name: 'V. Singh', role: 'batter', style: 'LHB' },
    { name: 'W. Barresi', role: 'batter', style: 'RHB' },
    { name: 'S. Edwards', role: 'wicketkeeper', style: 'RHB', captain: true },
    { name: 'B. de Leede', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'T. Nidamanuru', role: 'batter', style: 'RHB' },
    { name: 'L. van Beek', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'K. Klein', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. van der Merwe', role: 'allrounder', style: 'RHB/Left-arm Spin' },
    { name: 'P. van Meekeren', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'A. Dutt', role: 'bowler', style: 'Offbreak' }
  ],
  'oman': [
    { name: 'P. Athavale', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Prajapati', role: 'batter', style: 'RHB' },
    { name: 'A. Ilyas', role: 'batter', style: 'RHB', captain: true },
    { name: 'Z. Maqsood', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'A. Khan', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'K. Ali', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'N. Khushi', role: 'batter', style: 'RHB' },
    { name: 'M. Nadeem', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Ahmad', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'B. Khan', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'Fayyaz Butt', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'nepal': [
    { name: 'K. Bhurtel', role: 'batter', style: 'RHB' },
    { name: 'A. Sheikh', role: 'wicketkeeper', style: 'RHB' },
    { name: 'R. Paudel', role: 'batter', style: 'RHB', captain: true },
    { name: 'K. Malla', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'D. Airee', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'G. Jha', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'S. Kami', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'K. Karan', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Rajbanshi', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'S. Lamichhane', role: 'bowler', style: 'Legbreak' },
    { name: 'A. Saud', role: 'bowler', style: 'Right-arm Medium' }
  ],
  'nigeria': [
    { name: 'S. Runsewe', role: 'wicketkeeper', style: 'RHB' },
    { name: 'D. Abolarin', role: 'batter', style: 'RHB' },
    { name: 'I. Danladi', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'S. Adedeji', role: 'allrounder', style: 'LHB/Offbreak', captain: true },
    { name: 'C. Onwuzulike', role: 'batter', style: 'RHB' },
    { name: 'P. Aho', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'J. Asia', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Abdulkareem', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Taiwo', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'C. Udekwe', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'V. Adewoye', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'uganda': [
    { name: 'R. Mukasa', role: 'batter', style: 'RHB' },
    { name: 'S. Ssesazi', role: 'wicketkeeper', style: 'LHB' },
    { name: 'R. Patel', role: 'batter', style: 'RHB' },
    { name: 'D. Nakrani', role: 'allrounder', style: 'LHB/Medium' },
    { name: 'A. Ramjani', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'K. Waiswa', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'B. Masaba', role: 'allrounder', style: 'RHB/Fast', captain: true },
    { name: 'F. Nsubuga', role: 'bowler', style: 'Offbreak' },
    { name: 'J. Miyagi', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'H. Ssenyondo', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'C. Kyewuta', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'lesotho': [
    { name: 'C. Lerotholi', role: 'batter', style: 'RHB', captain: true },
    { name: 'M. Molapo', role: 'wicketkeeper', style: 'RHB' },
    { name: 'M. Gabriel', role: 'batter', style: 'RHB' },
    { name: 'T. Seeiso', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'K. Leokaoke', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'S. Tlali', role: 'batter', style: 'RHB' },
    { name: 'T. Lefothane', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Matsau', role: 'bowler', style: 'Left-arm Medium' },
    { name: 'W. Khan', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Mohapi', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'G. Senoko', role: 'bowler', style: 'Right-arm Medium' }
  ],
  'zambia': [
    { name: 'G. Mwamba', role: 'batter', style: 'RHB', captain: true },
    { name: 'C. Bwalya', role: 'wicketkeeper', style: 'RHB' },
    { name: 'J. Musonda', role: 'batter', style: 'RHB' },
    { name: 'P. Chileshe', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'I. Zimba', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'K. Mumba', role: 'batter', style: 'LHB' },
    { name: 'M. Tembo', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'T. Banda', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'M. Phiri', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Lungu', role: 'bowler', style: 'Offbreak' },
    { name: 'E. Mulenga', role: 'bowler', style: 'Legbreak' }
  ],

  // -------------------------------------------------------------
  // AUSTRALIA DOMESTIC (Sheffield Shield / Marsh Cup)
  // -------------------------------------------------------------
  'victoria': [
    { name: 'M. Harris', role: 'batter', style: 'LHB' },
    { name: 'W. Pucovski', role: 'batter', style: 'RHB' },
    { name: 'P. Handscomb', role: 'batter', style: 'RHB', captain: true },
    { name: 'M. Short', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'G. Maxwell', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'N. Maddinson', role: 'batter', style: 'LHB' },
    { name: 'S. Harper', role: 'wicketkeeper', style: 'RHB' },
    { name: 'W. Sutherland', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'S. Boland', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'T. Murphy', role: 'bowler', style: 'Offbreak' },
    { name: 'F. O\'Neill', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'tasmania': [
    { name: 'B. McDermott', role: 'batter', style: 'RHB' },
    { name: 'C. Jewell', role: 'batter', style: 'LHB' },
    { name: 'J. Silk', role: 'batter', style: 'RHB', captain: true },
    { name: 'M. Wade', role: 'wicketkeeper', style: 'LHB' },
    { name: 'B. Webster', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'J. Doran', role: 'batter', style: 'LHB' },
    { name: 'T. Andrews', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'N. Ellis', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Meredith', role: 'bowler', style: 'Right-arm Express' },
    { name: 'P. Siddle', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'G. Bell', role: 'bowler', style: 'Right-arm Medium' }
  ],
  'new south wales': [
    { name: 'D. Hughes', role: 'batter', style: 'LHB' },
    { name: 'K. Patterson', role: 'batter', style: 'LHB' },
    { name: 'M. Henriques', role: 'allrounder', style: 'RHB/Medium', captain: true },
    { name: 'O. Davies', role: 'batter', style: 'RHB' },
    { name: 'J. Edwards', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'M. Gilkes', role: 'wicketkeeper', style: 'LHB' },
    { name: 'C. Green', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'B. Dwarshuis', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'T. Sangha', role: 'bowler', style: 'Legbreak' },
    { name: 'S. Abbott', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'N. Lyon', role: 'bowler', style: 'Offbreak' }
  ],
  'queensland': [
    { name: 'U. Khawaja', role: 'batter', style: 'LHB', captain: true },
    { name: 'M. Renshaw', role: 'batter', style: 'LHB' },
    { name: 'M. Labuschagne', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'J. Burns', role: 'batter', style: 'RHB' },
    { name: 'J. Peirson', role: 'wicketkeeper', style: 'RHB' },
    { name: 'J. Clayton', role: 'batter', style: 'RHB' },
    { name: 'M. Neser', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'X. Bartlett', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Swepson', role: 'bowler', style: 'Legbreak' },
    { name: 'M. Steketee', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'G. Sandhu', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'western australia': [
    { name: 'C. Bancroft', role: 'batter', style: 'RHB' },
    { name: 'S. Whiteman', role: 'batter', style: 'LHB', captain: true },
    { name: 'C. Green', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'J. Inglis', role: 'wicketkeeper', style: 'RHB' },
    { name: 'A. Turner', role: 'batter', style: 'RHB' },
    { name: 'A. Hardie', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'H. Cartwright', role: 'batter', style: 'RHB' },
    { name: 'J. Richardson', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Paris', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'L. Morris', role: 'bowler', style: 'Right-arm Express' },
    { name: 'C. Rocchiccioli', role: 'bowler', style: 'Offbreak' }
  ],
  'south australia': [
    { name: 'H. Hunt', role: 'batter', style: 'RHB' },
    { name: 'J. Weatherald', role: 'batter', style: 'LHB' },
    { name: 'N. McSweeney', role: 'batter', style: 'RHB', captain: true },
    { name: 'D. Drew', role: 'batter', style: 'RHB' },
    { name: 'T. Kelly', role: 'batter', style: 'RHB' },
    { name: 'A. Carey', role: 'wicketkeeper', style: 'LHB' },
    { name: 'B. Manenti', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'N. McAndrew', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'W. Agar', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'H. Thornton', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Buckingham', role: 'bowler', style: 'Right-arm Fast' }
  ],

  // -------------------------------------------------------------
  // NEW ZEALAND DOMESTIC (The Ford Trophy / Plunket Shield)
  // -------------------------------------------------------------
  'central stags': [
    { name: 'C. Heaphy', role: 'batter', style: 'RHB' },
    { name: 'G. Worker', role: 'batter', style: 'LHB' },
    { name: 'W. Young', role: 'batter', style: 'RHB' },
    { name: 'T. Bruce', role: 'batter', style: 'RHB', captain: true },
    { name: 'D. Cleaver', role: 'wicketkeeper', style: 'RHB' },
    { name: 'J. Clarkson', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'D. Bracewell', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'A. Patel', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'B. Tickner', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. Small', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Toole', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'otago': [
    { name: 'L. Johnson', role: 'batter', style: 'LHB' },
    { name: 'H. Rutherford', role: 'batter', style: 'LHB' },
    { name: 'D. Foxcroft', role: 'allrounder', style: 'RHB/Offbreak', captain: true },
    { name: 'D. Phillips', role: 'batter', style: 'RHB' },
    { name: 'M. Chu', role: 'wicketkeeper', style: 'RHB' },
    { name: 'J. Cumming', role: 'batter', style: 'RHB' },
    { name: 'J. Gibson', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'T. Muller', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Duffy', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Rae', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Bacon', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'auckland': [
    { name: 'M. Guptill', role: 'batter', style: 'RHB' },
    { name: 'S. Solia', role: 'allrounder', style: 'LHB/Medium' },
    { name: 'M. Chapman', role: 'batter', style: 'LHB' },
    { name: 'R. O\'Donnell', role: 'batter', style: 'RHB', captain: true },
    { name: 'W. O\'Donnell', role: 'batter', style: 'LHB' },
    { name: 'C. Briggs', role: 'wicketkeeper', style: 'RHB' },
    { name: 'L. Delport', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'K. Jamieson', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'D. Ferns', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. Lister', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'M. Fisher', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'northern districts': [
    { name: 'T. Seifert', role: 'wicketkeeper', style: 'RHB' },
    { name: 'J. Raval', role: 'batter', style: 'LHB', captain: true },
    { name: 'H. Cooper', role: 'batter', style: 'RHB' },
    { name: 'J. Carter', role: 'batter', style: 'RHB' },
    { name: 'K. Clarke', role: 'batter', style: 'RHB' },
    { name: 'B. Hampton', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'S. Kuggeleijn', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'T. Pringle', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'N. Wagner', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'K. Clarke', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'F. Walker', role: 'bowler', style: 'Offbreak' }
  ],
  'canterbury': [
    { name: 'C. Bowes', role: 'batter', style: 'RHB' },
    { name: 'T. Latham', role: 'wicketkeeper', style: 'LHB' },
    { name: 'H. Nicholls', role: 'batter', style: 'LHB' },
    { name: 'C. McConchie', role: 'allrounder', style: 'RHB/Spin', captain: true },
    { name: 'L. Carter', role: 'batter', style: 'LHB' },
    { name: 'M. Hay', role: 'wicketkeeper', style: 'RHB' },
    { name: 'Z. Foulkes', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'M. Henry', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'W. O\'Rourke', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'I. Sodhi', role: 'bowler', style: 'Legbreak' },
    { name: 'F. Sheat', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'wellington': [
    { name: 'T. Robinson', role: 'batter', style: 'RHB' },
    { name: 'N. Kelly', role: 'batter', style: 'LHB', captain: true },
    { name: 'T. Blundell', role: 'wicketkeeper', style: 'RHB' },
    { name: 'M. Snedden', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'C. Tashkoff', role: 'batter', style: 'LHB' },
    { name: 'P. Younghusband', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'N. Greenwood', role: 'batter', style: 'RHB' },
    { name: 'L. van Beek', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'I. McPeake', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Bhula', role: 'bowler', style: 'Offbreak' },
    { name: 'A. Sears', role: 'bowler', style: 'Right-arm Express' }
  ],

  // -------------------------------------------------------------
  // WOMEN'S CRICKET & WBBL
  // -------------------------------------------------------------
  'australia women': [
    { name: 'A. Healy', role: 'wicketkeeper', style: 'RHB', captain: true },
    { name: 'B. Mooney', role: 'batter', style: 'LHB' },
    { name: 'E. Perry', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'P. Litchfield', role: 'batter', style: 'LHB' },
    { name: 'T. McGrath', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'A. Gardner', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'G. Harris', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'A. Sutherland', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'A. King', role: 'bowler', style: 'Legbreak' },
    { name: 'M. Schutt', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'D. Brown', role: 'bowler', style: 'Right-arm Express' }
  ],
  'india women': [
    { name: 'S. Mandhana', role: 'batter', style: 'LHB' },
    { name: 'S. Verma', role: 'batter', style: 'RHB' },
    { name: 'J. Rodrigues', role: 'batter', style: 'RHB' },
    { name: 'H. Kaur', role: 'allrounder', style: 'RHB/Spin', captain: true },
    { name: 'R. Ghosh', role: 'wicketkeeper', style: 'RHB' },
    { name: 'D. Sharma', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'P. Vastrakar', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'A. Reddy', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Pandey', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Gayakwad', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'R. Singh', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'melbourne stars women': [
    { name: 'M. Lanning', role: 'batter', style: 'RHB', captain: true },
    { name: 'D. Hemalatha', role: 'batter', style: 'RHB' },
    { name: 'A. Sutherland', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'M. Kapp', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'M. Bouchier', role: 'batter', style: 'RHB' },
    { name: 'T. Flintoff', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'S. Reid', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Garth', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Day', role: 'bowler', style: 'Legbreak' },
    { name: 'R. McKenna', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'H. Bouchier', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'perth scorchers women': [
    { name: 'B. Mooney', role: 'wicketkeeper', style: 'LHB' },
    { name: 'S. Devine', role: 'allrounder', style: 'RHB/Medium', captain: true },
    { name: 'C. Piparo', role: 'batter', style: 'RHB' },
    { name: 'A. Edgar', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'M. Carmichael', role: 'batter', style: 'RHB' },
    { name: 'A. King', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'P. Cleary', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'L. Peschel', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'C. Ainsworth', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Griffith', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'E. Bungey', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'melbourne renegades women': [
    { name: 'H. Matthews', role: 'allrounder', style: 'RHB/Spin', captain: true },
    { name: 'E. Beaumont', role: 'batter', style: 'RHB' },
    { name: 'C. Webb', role: 'batter', style: 'RHB' },
    { name: 'G. Wareham', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'S. Molineux', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'J. Dooley', role: 'wicketkeeper', style: 'RHB' },
    { name: 'E. Falconer', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'S. Coyte', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'T. Peschel', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Taylor', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'G. Prestwidge', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'sydney sixers women': [
    { name: 'A. Healy', role: 'wicketkeeper', style: 'RHB' },
    { name: 'E. Perry', role: 'allrounder', style: 'RHB/Fast', captain: true },
    { name: 'A. Gardner', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'E. Burns', role: 'batter', style: 'RHB' },
    { name: 'M. Brown', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'H. Silver-Holmes', role: 'batter', style: 'RHB' },
    { name: 'S. Campbell', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'L. Cheatle', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'K. Peterson', role: 'bowler', style: 'Offbreak' },
    { name: 'C. Hall', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'J. Kerr', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'adelaide strikers women': [
    { name: 'L. Wolvaardt', role: 'batter', style: 'RHB' },
    { name: 'K. Mack', role: 'batter', style: 'RHB' },
    { name: 'T. McGrath', role: 'allrounder', style: 'RHB/Medium', captain: true },
    { name: 'B. Patterson', role: 'wicketkeeper', style: 'RHB' },
    { name: 'M. Penna', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'A. Wellington', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'J. Barsby', role: 'bowler', style: 'Offbreak' },
    { name: 'D. Brown', role: 'bowler', style: 'Right-arm Express' },
    { name: 'M. Schutt', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'E. de Broughe', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'A. O\'Neil', role: 'bowler', style: 'Left-arm Spin' }
  ],
  'brisbane heat women': [
    { name: 'G. Harris', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'G. Redmayne', role: 'wicketkeeper', style: 'LHB' },
    { name: 'J. Jonassen', role: 'allrounder', style: 'LHB/Left-arm Spin', captain: true },
    { name: 'C. Knott', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'L. Harris', role: 'batter', style: 'RHB' },
    { name: 'N. Hancock', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'G. Voll', role: 'batter', style: 'RHB' },
    { name: 'M. Hinkley', role: 'batter', style: 'LHB' },
    { name: 'C. Sippel', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Smith', role: 'bowler', style: 'Legbreak' },
    { name: 'M. Dixon', role: 'bowler', style: 'Right-arm Fast' }
  ],

  // -------------------------------------------------------------
  // INDIAN RANJI TROPHY (Elite & Plate Teams)
  // -------------------------------------------------------------
  'mumbai': [
    { name: 'P. Shaw', role: 'batter', style: 'RHB' },
    { name: 'A. Rahane', role: 'batter', style: 'RHB', captain: true },
    { name: 'S. Iyer', role: 'batter', style: 'RHB' },
    { name: 'S. Khan', role: 'batter', style: 'RHB' },
    { name: 'S. Dube', role: 'allrounder', style: 'LHB/Medium' },
    { name: 'H. Tamore', role: 'wicketkeeper', style: 'RHB' },
    { name: 'S. Mulani', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'T. Kotian', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'T. Deshpande', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Thakur', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Avasthi', role: 'bowler', style: 'Right-arm Medium' }
  ],
  'karnataka': [
    { name: 'M. Agarwal', role: 'batter', style: 'RHB', captain: true },
    { name: 'D. Padikkal', role: 'batter', style: 'LHB' },
    { name: 'N. Jose', role: 'batter', style: 'RHB' },
    { name: 'M. Pandey', role: 'batter', style: 'RHB' },
    { name: 'S. Sharath', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Gowtham', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'S. Gopal', role: 'allrounder', style: 'RHB/Legbreak' },
    { name: 'V. Vyshak', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'V. Koushik', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'P. Krishna', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'M. Bhandage', role: 'bowler', style: 'Right-arm Medium' }
  ],
  'delhi': [
    { name: 'Y. Dhull', role: 'batter', style: 'RHB' },
    { name: 'H. Rana', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'A. Rawat', role: 'wicketkeeper', style: 'LHB' },
    { name: 'H. Shokeen', role: 'allrounder', style: 'RHB/Offbreak', captain: true },
    { name: 'L. Yadav', role: 'allrounder', style: 'RHB/Offbreak' },
    { name: 'D. Shorey', role: 'batter', style: 'RHB' },
    { name: 'N. Saini', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'I. Sharma', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'P. Sangwan', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'S. Sharma', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'H. Vashisht', role: 'bowler', style: 'Left-arm Spin' }
  ],
  'tamil nadu': [
    { name: 'N. Jagadeesan', role: 'wicketkeeper', style: 'RHB' },
    { name: 'S. Sudharsan', role: 'batter', style: 'LHB' },
    { name: 'B. Indrajith', role: 'batter', style: 'RHB' },
    { name: 'V. Shankar', role: 'allrounder', style: 'RHB/Medium', captain: true },
    { name: 'S. Khan', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'P. Paul', role: 'batter', style: 'RHB' },
    { name: 'W. Sundar', role: 'allrounder', style: 'LHB/Offbreak' },
    { name: 'R. Sai Kishore', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'M. Mohammed', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'T. Natarajan', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'S. Warrier', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'nagaland': [
    { name: 'R. Jonathan', role: 'batter', style: 'RHB', captain: true },
    { name: 'S. Mundhe', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'C. Zhimomi', role: 'batter', style: 'RHB' },
    { name: 'H. Zhimomi', role: 'batter', style: 'RHB' },
    { name: 'N. Kazi', role: 'allrounder', style: 'RHB/Spin' },
    { name: 'I. Lemtur', role: 'allrounder', style: 'LHB/Left-arm Spin' },
    { name: 'T. Zhimomi', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Kense', role: 'bowler', style: 'Legbreak' },
    { name: 'T. Swu', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'C. Jami', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'P. Bora', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'mizoram': [
    { name: 'V. Lalhruaizela', role: 'batter', style: 'RHB' },
    { name: 'J. Lalthankhuma', role: 'wicketkeeper', style: 'RHB' },
    { name: 'A. Singh', role: 'batter', style: 'RHB', captain: true },
    { name: 'M. Zothanchhunga', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'K. Vanrotlinga', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'K. Chawnghlut', role: 'batter', style: 'RHB' },
    { name: 'B. Lalnunfela', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'T. Kohli', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'L. Ralte', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Remruatdika', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'N. Ralte', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'arunachal pradesh': [
    { name: 'T. Techi', role: 'batter', style: 'RHB' },
    { name: 'D. Nishi', role: 'wicketkeeper', style: 'RHB' },
    { name: 'K. Kamsha', role: 'batter', style: 'RHB', captain: true },
    { name: 'N. Tana', role: 'allrounder', style: 'RHB/Fast' },
    { name: 'L. Teli', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'T. Doria', role: 'batter', style: 'RHB' },
    { name: 'M. Kamsho', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'Y. Tana', role: 'bowler', style: 'Left-arm Fast' },
    { name: 'C. Techi', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'L. Nishi', role: 'bowler', style: 'Offbreak' },
    { name: 'S. Nabam', role: 'bowler', style: 'Right-arm Fast' }
  ],
  'meghalaya': [
    { name: 'K. Marak', role: 'batter', style: 'RHB', captain: true },
    { name: 'L. Nongrum', role: 'batter', style: 'RHB' },
    { name: 'P. Lyngdoh', role: 'wicketkeeper', style: 'RHB' },
    { name: 'D. Sangma', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'C. Khongwir', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'A. Sangma', role: 'batter', style: 'RHB' },
    { name: 'W. Marak', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. Lyngdoh', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'S. Nongrum', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'T. Sangma', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Khongwir', role: 'bowler', style: 'Offbreak' }
  ],
  'manipur': [
    { name: 'N. Johnson', role: 'batter', style: 'RHB' },
    { name: 'P. Prafullomani', role: 'wicketkeeper', style: 'RHB' },
    { name: 'L. Kishan', role: 'allrounder', style: 'LHB/Left-arm Spin', captain: true },
    { name: 'B. Konthoujam', role: 'batter', style: 'RHB' },
    { name: 'R. Shah', role: 'batter', style: 'RHB' },
    { name: 'C. Priyojit', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'L. Ajay', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'J. Singh', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'B. Sanatomba', role: 'bowler', style: 'Offbreak' },
    { name: 'T. Somorjit', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'R. Rex', role: 'bowler', style: 'Left-arm Fast' }
  ],
  'sikkim': [
    { name: 'A. Chettri', role: 'batter', style: 'RHB', captain: true },
    { name: 'P. Tamang', role: 'allrounder', style: 'RHB/Medium' },
    { name: 'L. Lepcha', role: 'batter', style: 'LHB' },
    { name: 'K. Subba', role: 'wicketkeeper', style: 'RHB' },
    { name: 'T. Bhutia', role: 'allrounder', style: 'LHB/Spin' },
    { name: 'B. Sharma', role: 'batter', style: 'RHB' },
    { name: 'R. Pradhan', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'A. Limboo', role: 'bowler', style: 'Left-arm Spin' },
    { name: 'M. Gurung', role: 'bowler', style: 'Right-arm Fast' },
    { name: 'D. Rai', role: 'bowler', style: 'Right-arm Medium' },
    { name: 'S. Tamang', role: 'bowler', style: 'Offbreak' }
  ]
};

// Standard cricket surname pools for deterministic procedural generation of unknown teams
const SURNAME_POOLS = {
  african: ['Olawale', 'Balogun', 'Bwalya', 'Chileshe', 'Mwamba', 'Musonda', 'Seeiso', 'Lerotholi', 'Adedeji', 'Mumba', 'Tembo', 'Zimba'],
  asian: ['Rathore', 'Perera', 'Hasan', 'Silva', 'Das', 'Khan', 'Ahmed', 'Ali', 'Iqbal', 'Rahman', 'Islam', 'Fernando'],
  pacific: ['Vala', 'Amini', 'Bau', 'Siaka', 'Doriga', 'Vanua', 'Morea', 'Nao', 'Kariko', 'Ura', 'Hiri', 'Kila'],
  latin: ['Castillo', 'Morales', 'Ramirez', 'Cruz', 'Gomez', 'Martinez', 'Rodriguez', 'Sanchez', 'Perez', 'Flores', 'Vargas', 'Lopez'],
  anglo: ['Smith', 'Taylor', 'Davies', 'Walker', 'Evans', 'Clarke', 'Wilson', 'Harris', 'Robinson', 'Hall', 'Wright', 'Carter']
};

/**
 * Generate a unique 11-player squad for any team name deterministically
 */
export function getTeamRoster(teamRawName, seedStr = '') {
  if (!teamRawName) return TEAM_ROSTERS['india'];

  // Clean team name: remove [CODE] and normalize
  const cleanName = teamRawName.split('[')[0].trim().toLowerCase();

  // 1. Direct or partial key match in TEAM_ROSTERS
  for (const [key, squad] of Object.entries(TEAM_ROSTERS)) {
    if (cleanName === key || cleanName.includes(key) || key.includes(cleanName)) {
      return squad;
    }
  }

  // 2. Deterministic generator for arbitrary or unknown teams
  const poolType = cleanName.includes('women') || cleanName.includes('-w')
    ? 'anglo'
    : cleanName.includes('nigeria') || cleanName.includes('zambia') || cleanName.includes('lesotho') || cleanName.includes('gambia') || cleanName.includes('africa')
    ? 'african'
    : cleanName.includes('mexico') || cleanName.includes('argentina') || cleanName.includes('brazil')
    ? 'latin'
    : cleanName.includes('png') || cleanName.includes('papua') || cleanName.includes('fiji')
    ? 'pacific'
    : cleanName.includes('kuwait') || cleanName.includes('qatar') || cleanName.includes('uae') || cleanName.includes('oman') || cleanName.includes('nepal')
    ? 'asian'
    : 'anglo';

  const surnames = SURNAME_POOLS[poolType] || SURNAME_POOLS.anglo;
  const initials = ['A.', 'J.', 'M.', 'D.', 'S.', 'R.', 'K.', 'T.', 'C.', 'P.', 'L.', 'B.', 'G.', 'N.'];
  
  // Calculate deterministic seed from team name
  let hash = 0;
  for (let i = 0; i < teamRawName.length; i++) {
    hash = (hash << 5) - hash + teamRawName.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const squad = [];
  const roles = [
    { role: 'batter', style: 'RHB', captain: true },
    { role: 'batter', style: 'LHB' },
    { role: 'batter', style: 'RHB' },
    { role: 'batter', style: 'RHB' },
    { role: 'wicketkeeper', style: 'RHB' },
    { role: 'allrounder', style: 'RHB/Medium' },
    { role: 'allrounder', style: 'LHB/Spin' },
    { role: 'bowler', style: 'Right-arm Fast' },
    { role: 'bowler', style: 'Right-arm Fast' },
    { role: 'bowler', style: 'Left-arm Spin' },
    { role: 'bowler', style: 'Right-arm Medium' }
  ];

  for (let i = 0; i < 11; i++) {
    const init = initials[(hash + i * 3) % initials.length];
    const sur = surnames[(hash + i) % surnames.length];
    squad.push({
      name: `${init} ${sur}`,
      role: roles[i].role,
      style: roles[i].style,
      captain: roles[i].captain || false
    });
  }

  return squad;
}

/**
 * Get opposing team's bowling unit (5 to 6 bowlers from the opposing squad)
 */
export function getOpposingBowlers(opposingTeamRawName, seedStr = '') {
  const opposingSquad = getTeamRoster(opposingTeamRawName, seedStr);
  
  // Prioritize bowlers and allrounders from the opposing squad
  const bowlers = opposingSquad.filter(p => p.role === 'bowler' || p.role === 'allrounder');
  if (bowlers.length >= 5) {
    return bowlers.slice(0, 6);
  }

  // Fallback: take bottom 5-6 players from the opposing roster
  return opposingSquad.slice(opposingSquad.length - 5);
}

/**
 * Get opposing wicketkeeper and key fielders for realistic dismissal generation
 */
export function getOpposingFielders(opposingTeamRawName, seedStr = '') {
  const opposingSquad = getTeamRoster(opposingTeamRawName, seedStr);
  const keeper = opposingSquad.find(p => p.role === 'wicketkeeper') || opposingSquad[4] || { name: 'Keeper' };
  const fielders = opposingSquad.slice(0, 6).map(p => p.name);
  return { keeper: keeper.name, fielders };
}
