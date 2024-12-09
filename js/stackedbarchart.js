document.addEventListener('DOMContentLoaded', function () {
    // Raw data (population counts for each region and category)
    const rawData = [
        { region: "Allston", series: "Age", type: "Census", "0-17 years old": 740, "18-34 years old": 15405, "35+ years old": 3116 },
        { region: "Back Bay", series: "Age", type: "Census", "0-17 years old": 1169, "18-34 years old": 8398, "35+ years old": 8216 },
        { region: "Beacon Hill", series: "Age", type: "Census", "0-17 years old": 862, "18-34 years old": 4564, "35+ years old": 4222 },
        { region: "Brighton", series: "Age", type: "Census", "0-17 years old": 5275, "18-34 years old": 30631, "35+ years old": 19391 },
        { region: "Charlestown", series: "Age", type: "Census", "0-17 years old": 3974, "18-34 years old": 5789, "35+ years old": 10127 },
        { region: "Dorchester", series: "Age", type: "Census", "0-17 years old": 28122, "18-34 years old": 39249, "35+ years old": 59538 },
        { region: "Downtown", series: "Age", type: "Census", "0-17 years old": 1507, "18-34 years old": 8249, "35+ years old": 8550 },
        { region: "East Boston", series: "Age", type: "Census", "0-17 years old": 9176, "18-34 years old": 15775, "35+ years old": 22312 },
        { region: "Fenway", series: "Age", type: "Census", "0-17 years old": 699, "18-34 years old": 26568, "35+ years old": 6222 },
        { region: "Hyde Park", series: "Age", type: "Census", "0-17 years old": 8288, "18-34 years old": 8827, "35+ years old": 21809 },
        { region: "Jamaica Plain", series: "Age", type: "Census", "0-17 years old": 6621, "18-34 years old": 13960, "35+ years old": 20286 },
        { region: "Longwood", series: "Age", type: "Census", "0-17 years old": 51, "18-34 years old": 5172, "35+ years old": 128 },
        { region: "Mattapan", series: "Age", type: "Census", "0-17 years old": 6568, "18-34 years old": 6157, "35+ years old": 13934 },
        { region: "Mission Hill", series: "Age", type: "Census", "0-17 years old": 1485, "18-34 years old": 10023, "35+ years old": 5878 },
        { region: "North End", series: "Age", type: "Census", "0-17 years old": 509, "18-34 years old": 5227, "35+ years old": 3013 },
        { region: "Roslindale", series: "Age", type: "Census", "0-17 years old": 5979, "18-34 years old": 6865, "35+ years old": 17177 },
        { region: "Roxbury", series: "Age", type: "Census", "0-17 years old": 11846, "18-34 years old": 17728, "35+ years old": 24587 },
        { region: "South Boston", series: "Age", type: "Census", "0-17 years old": 4661, "18-34 years old": 17242, "35+ years old": 14869 },
        { region: "South Boston Waterfront", series: "Age", type: "Census", "0-17 years old": 189, "18-34 years old": 2081, "35+ years old": 2133 },
        { region: "South End", series: "Age", type: "Census", "0-17 years old": 3965, "18-34 years old": 11389, "35+ years old": 17217 },
        { region: "West End", series: "Age", type: "Census", "0-17 years old": 422, "18-34 years old": 2645, "35+ years old": 3552 },
        { region: "West Roxbury", series: "Age", type: "Census", "0-17 years old": 6895, "18-34 years old": 6381, "35+ years old": 20250 },
    
        { region: "Allston", series: "Age", type: "MBTA", "0-17 years old": 0.006962193, "18-34 years old": 0.216011928, "35+ years old": 0.110359212 },
        { region: "Back Bay", series: "Age", type: "MBTA", "0-17 years old": 0.019176843, "18-34 years old": 0.652402597, "35+ years old": 0.32842056 },
        { region: "Beacon Hill", series: "Age", type: "MBTA", "0-17 years old": 0.005430476, "18-34 years old": 0.569224764, "35+ years old": 0.42534476 },
        { region: "Brighton", series: "Age", type: "MBTA", "0-17 years old": 0.006962193, "18-34 years old": 0.216011928, "35+ years old": 0.110359212 },
        { region: "Charlestown", series: "Age", type: "MBTA", "0-17 years old": 0.034703714, "18-34 years old": 0.703991779, "35+ years old": 0.202820481 },
        { region: "Dorchester", series: "Age", type: "MBTA", "0-17 years old": 0.09318774, "18-34 years old": 0.642873045, "35+ years old": 0.265813332 },
        { region: "Downtown", series: "Age", type: "MBTA", "0-17 years old": 0.028701449, "18-34 years old": 0.686196416, "35+ years old": 0.292919133 },
        { region: "East Boston", series: "Age", type: "MBTA", "0-17 years old": 0.070244605, "18-34 years old": 0.686196416, "35+ years old": 0.357256208 },
        { region: "Fenway", series: "Age", type: "MBTA", "0-17 years old": 0.003272931, "18-34 years old": 0.612028814, "35+ years old": 0.366815472 },
        { region: "Hyde Park", series: "Age", type: "MBTA", "0-17 years old": 0.030683644, "18-34 years old": 0.65556884, "35+ years old": 0.321665407 },
        { region: "Jamaica Plain", series: "Age", type: "MBTA", "0-17 years old": 0.030683644, "18-34 years old": 0.720258299, "35+ years old": 0.261211071 },
        { region: "Longwood", series: "Age", type: "MBTA", "0-17 years old": 0.003272931, "18-34 years old": 0.648273645, "35+ years old": 0.285459412 },
        { region: "Mattapan", series: "Age", type: "MBTA", "0-17 years old": 0.067853336, "18-34 years old": 0.63866357, "35+ years old": 0.341679964 },
        { region: "Mission Hill", series: "Age", type: "MBTA", "0-17 years old": 0.014404763, "18-34 years old": 0.700135825, "35+ years old": 0.285459412 },
        { region: "North End", series: "Age", type: "MBTA", "0-17 years old": 0.020844451, "18-34 years old": 0.686196416, "35+ years old": 0.292919133 },
        { region: "Roslindale", series: "Age", type: "MBTA", "0-17 years old": 0.030683644, "18-34 years old": 0.191797413, "35+ years old": 0.110852276 },
        { region: "Roxbury", series: "Age", type: "MBTA", "0-17 years old": 0.091313625, "18-34 years old": 0.642873045, "35+ years old": 0.265813332 },
        { region: "South Boston", series: "Age", type: "MBTA", "0-17 years old": 0.019658466, "18-34 years old": 0.63866357, "35+ years old": 0.341679964 },
        { region: "South Boston Waterfront", series: "Age", type: "MBTA", "0-17 years old": 0.021155714, "18-34 years old": 0.612028814, "35+ years old": 0.366815472 },
        { region: "South End", series: "Age", type: "MBTA", "0-17 years old": 0.022768709, "18-34 years old": 0.65556884, "35+ years old": 0.321665407 },
        { region: "West End", series: "Age", type: "MBTA", "0-17 years old": 0.01853063, "18-34 years old": 0.720258299, "35+ years old": 0.261211071 },
        { region: "West Roxbury", series: "Age", type: "MBTA", "0-17 years old": 0.030683644, "18-34 years old": 0.191797413, "35+ years old": 0.110852276 },

        { region: "Allston", series: "Race", type: "Census", "White Alone": 9839, "Black Alone": 1099, "Asian Alone": 4811, "Other Races": 3512 },
        { region: "Allston", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 3327, "1 Vehicle": 2081, "2 Vehicles": 854, "3+ Vehicles": 264 },
        { region: "Back Bay", series: "Race", type: "Census", "White Alone": 13044, "Black Alone": 761, "Asian Alone": 1917, "Other Races": 2061 },
        { region: "Back Bay", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 4820, "1 Vehicle": 3952, "2 Vehicles": 960, "3+ Vehicles": 97 },
        { region: "Beacon Hill", series: "Race", type: "Census", "White Alone": 8074, "Black Alone": 138, "Asian Alone": 578, "Other Races": 858 },
        { region: "Beacon Hill", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2767, "1 Vehicle": 2228, "2 Vehicles": 372, "3+ Vehicles": 60 },
        { region: "Brighton", series: "Race", type: "Census", "White Alone": 36019, "Black Alone": 2379, "Asian Alone": 8160, "Other Races": 8739 },
        { region: "Brighton", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 6707, "1 Vehicle": 9327, "2 Vehicles": 5067, "3+ Vehicles": 1597 },
        { region: "Charlestown", series: "Race", type: "Census", "White Alone": 14692, "Black Alone": 1019, "Asian Alone": 1613, "Other Races": 2566 },
        { region: "Charlestown", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2218, "1 Vehicle": 4860, "2 Vehicles": 1846, "3+ Vehicles": 238 },
        { region: "Dorchester", series: "Race", type: "Census", "White Alone": 28244, "Black Alone": 55787, "Asian Alone": 12540, "Other Races": 30338 },
        { region: "Dorchester", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 13146, "1 Vehicle": 18663, "2 Vehicles": 9583, "3+ Vehicles": 2909 },
        { region: "Downtown", series: "Race", type: "Census", "White Alone": 10172, "Black Alone": 730, "Asian Alone": 5701, "Other Races": 1703 },
        { region: "Downtown", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 4517, "1 Vehicle": 2954, "2 Vehicles": 443, "3+ Vehicles": 28 },
        { region: "East Boston", series: "Race", type: "Census", "White Alone": 16011, "Black Alone": 1171, "Asian Alone": 2167, "Other Races": 27914 },
        { region: "East Boston", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 6118, "1 Vehicle": 7336, "2 Vehicles": 2474, "3+ Vehicles": 637 },
        { region: "Fenway", series: "Race", type: "Census", "White Alone": 18856, "Black Alone": 1810, "Asian Alone": 7071, "Other Races": 5752 },
        { region: "Fenway", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 7174, "1 Vehicle": 3444, "2 Vehicles": 554, "3+ Vehicles": 54 },
        { region: "Hyde Park", series: "Race", type: "Census", "White Alone": 8719, "Black Alone": 18042, "Asian Alone": 763, "Other Races": 11400 },
        { region: "Hyde Park", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2355, "1 Vehicle": 4782, "2 Vehicles": 4048, "3+ Vehicles": 1962 },
        { region: "Jamaica Plain", series: "Race", type: "Census", "White Alone": 22533, "Black Alone": 5825, "Asian Alone": 2004, "Other Races": 10505 },
        { region: "Jamaica Plain", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 3934, "1 Vehicle": 8165, "2 Vehicles": 3475, "3+ Vehicles": 849 },
        { region: "Longwood", series: "Race", type: "Census", "White Alone": 3746, "Black Alone": 291, "Asian Alone": 752, "Other Races": 562 },
        { region: "Longwood", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 206, "1 Vehicle": 53, "2 Vehicles": 10, "3+ Vehicles": 0 },
        { region: "Mattapan", series: "Race", type: "Census", "White Alone": 1612, "Black Alone": 19821, "Asian Alone": 499, "Other Races": 4727 },
        { region: "Mattapan", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2271, "1 Vehicle": 4140, "2 Vehicles": 2258, "3+ Vehicles": 504 },
        { region: "Mission Hill", series: "Race", type: "Census", "White Alone": 7156, "Black Alone": 2662, "Asian Alone": 3419, "Other Races": 4149 },
        { region: "Mission Hill", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 3808, "1 Vehicle": 2411, "2 Vehicles": 382, "3+ Vehicles": 86 },
        { region: "North End", series: "Race", type: "Census", "White Alone": 7692, "Black Alone": 29, "Asian Alone": 287, "Other Races": 741 },
        { region: "North End", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2814, "1 Vehicle": 1803, "2 Vehicles": 416, "3+ Vehicles": 53 },
        { region: "Roslindale", series: "Race", type: "Census", "White Alone": 15291, "Black Alone": 5805, "Asian Alone": 750, "Other Races": 8175 },
        { region: "Roslindale", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 1423, "1 Vehicle": 5457, "2 Vehicles": 3628, "3+ Vehicles": 974 },
        { region: "Roxbury", series: "Race", type: "Census", "White Alone": 5937, "Black Alone": 27243, "Asian Alone": 1905, "Other Races": 19076 },
        { region: "Roxbury", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 9019, "1 Vehicle": 7498, "2 Vehicles": 2552, "3+ Vehicles": 830 },
        { region: "South Boston", series: "Race", type: "Census", "White Alone": 28008, "Black Alone": 2064, "Asian Alone": 2070, "Other Races": 4630 },
        { region: "South Boston", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 4596, "1 Vehicle": 7880, "2 Vehicles": 3568, "3+ Vehicles": 686 },
        { region: "South Boston Waterfront", series: "Race", type: "Census", "White Alone": 3640, "Black Alone": 93, "Asian Alone": 425, "Other Races": 245 },
        { region: "South Boston Waterfront", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 679, "1 Vehicle": 1594, "2 Vehicles": 348, "3+ Vehicles": 7 },
        { region: "South End", series: "Race", type: "Census", "White Alone": 18044, "Black Alone": 3669, "Asian Alone": 4974, "Other Races": 5884 },
        { region: "South End", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 6686, "1 Vehicle": 7866, "2 Vehicles": 1939, "3+ Vehicles": 328 },
        { region: "West End", series: "Race", type: "Census", "White Alone": 4436, "Black Alone": 463, "Asian Alone": 706, "Other Races": 1014 },
        { region: "West End", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 2048, "1 Vehicle": 1315, "2 Vehicles": 185, "3+ Vehicles": 10 },
        { region: "West Roxbury", series: "Race", type: "Census", "White Alone": 22584, "Black Alone": 4094, "Asian Alone": 2500, "Other Races": 4348 },
        { region: "West Roxbury", series: "Vehicles per Household", type: "Census", "No Access to a Vehicle": 1602, "1 Vehicle": 6127, "2 Vehicles": 4841, "3+ Vehicles": 1363 },
        { region: "Allston", series: "Race", type: "MBTA", "White Alone": 0.607825571, "Black Alone": 0.183206909, "Asian Alone": 0.204518248, "Other Races": 0.102378006 },
        { region: "Allston", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.384450784, "1 Vehicle": 0.39032001, "2 Vehicles": 0.196485083, "3+ Vehicles": 0.028744123 },
        { region: "Back Bay", series: "Race", type: "MBTA", "White Alone": 0.543349084, "Black Alone": 0.238128825, "Asian Alone": 0.125969215, "Other Races": 0.15680911 },
        { region: "Back Bay", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.365125118, "1 Vehicle": 0.414075582, "2 Vehicles": 0.193810962, "3+ Vehicles": 0.026988337 },
        { region: "Beacon Hill", series: "Race", type: "MBTA", "White Alone": 0.553723601, "Black Alone": 0.260399602, "Asian Alone": 0.142031779, "Other Races": 0.096361455 },
        { region: "Beacon Hill", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.320695567, "1 Vehicle": 0.442007899, "2 Vehicles": 0.190436622, "3+ Vehicles": 0.046859912 },
        { region: "Brighton", series: "Race", type: "MBTA", "White Alone": 0.607825571, "Black Alone": 0.183206909, "Asian Alone": 0.204518248, "Other Races": 0.102378006 },
        { region: "Brighton", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.384450784, "1 Vehicle": 0.39032001, "2 Vehicles": 0.196485083, "3+ Vehicles": 0.028744123 },
        { region: "Charlestown", series: "Race", type: "MBTA", "White Alone": 0.470860682, "Black Alone": 0.215783322, "Asian Alone": 0.187487906, "Other Races": 0.179047624 },
        { region: "Charlestown", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.368632097, "1 Vehicle": 0.486255913, "2 Vehicles": 0.129488097, "3+ Vehicles": 0.015623892 },
        { region: "Dorchester", series: "Race", type: "MBTA", "White Alone": 0.386010268, "Black Alone": 0.351133679, "Asian Alone": 0.172769897, "Other Races": 0.143849287 },
        { region: "Dorchester", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.37694671, "1 Vehicle": 0.403777193, "2 Vehicles": 0.156659615, "3+ Vehicles": 0.062616483 },
        { region: "Downtown", series: "Race", type: "MBTA", "White Alone": 0.486151174, "Black Alone": 0.289581355, "Asian Alone": 0.150688463, "Other Races": 0.140684669 },
        { region: "Downtown", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.411392742, "1 Vehicle": 0.396885679, "2 Vehicles": 0.159207948, "3+ Vehicles": 0.032513631 },
        { region: "East Boston", series: "Race", type: "MBTA", "White Alone": 0.594450972, "Black Alone": 0.16672629, "Asian Alone": 0.053062956, "Other Races": 0.301661435 },
        { region: "East Boston", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.484115056, "1 Vehicle": 0.366183825, "2 Vehicles": 0.117968107, "3+ Vehicles": 0.031733011 },
        { region: "Fenway", series: "Race", type: "MBTA", "White Alone": 0.68277487, "Black Alone": 0.122297165, "Asian Alone": 0.181331171, "Other Races": 0.102553658 },
        { region: "Fenway", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.390867629, "1 Vehicle": 0.408931622, "2 Vehicles": 0.155720939, "3+ Vehicles": 0.04447981 },
        { region: "Hyde Park", series: "Race", type: "MBTA", "White Alone": 0.485008979, "Black Alone": 0.38121675, "Asian Alone": 0.106195413, "Other Races": 0.1258407 },
        { region: "Hyde Park", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.347114406, "1 Vehicle": 0.415855263, "2 Vehicles": 0.179802568, "3+ Vehicles": 0.057227763 },
        { region: "Jamaica Plain", series: "Race", type: "MBTA", "White Alone": 0.485008979, "Black Alone": 0.38121675, "Asian Alone": 0.106195413, "Other Races": 0.1258407 },
        { region: "Jamaica Plain", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.347114406, "1 Vehicle": 0.415855263, "2 Vehicles": 0.179802568, "3+ Vehicles": 0.057227763 },
        { region: "Longwood", series: "Race", type: "MBTA", "White Alone": 0.68277487, "Black Alone": 0.122297165, "Asian Alone": 0.181331171, "Other Races": 0.102553658 },
        { region: "Longwood", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.390867629, "1 Vehicle": 0.408931622, "2 Vehicles": 0.155720939, "3+ Vehicles": 0.04447981 },
        { region: "Mattapan", series: "Race", type: "MBTA", "White Alone": 0.307495066, "Black Alone": 0.635070751, "Asian Alone": 0.02692139, "Other Races": 0.069184606 },
        { region: "Mattapan", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.432179953, "1 Vehicle": 0.396548368, "2 Vehicles": 0.160261901, "3+ Vehicles": 0.011009777 },
        { region: "Mission Hill", series: "Race", type: "MBTA", "White Alone": 0.530305309, "Black Alone": 0.188509226, "Asian Alone": 0.216404633, "Other Races": 0.130802004 },
        { region: "Mission Hill", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.479946604, "1 Vehicle": 0.376262718, "2 Vehicles": 0.104536623, "3+ Vehicles": 0.039254055 },
        { region: "North End", series: "Race", type: "MBTA", "White Alone": 0.569697822, "Black Alone": 0.224476388, "Asian Alone": 0.157787243, "Other Races": 0.161455479 },
        { region: "North End", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.400220039, "1 Vehicle": 0.431742981, "2 Vehicles": 0.149129414, "3+ Vehicles": 0.018907566 },
        { region: "Roslindale", series: "Race", type: "MBTA", "White Alone": 0.485008979, "Black Alone": 0.38121675, "Asian Alone": 0.106195413, "Other Races": 0.1258407 },
        { region: "Roslindale", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.347114406, "1 Vehicle": 0.415855263, "2 Vehicles": 0.179802568, "3+ Vehicles": 0.057227763 },
        { region: "Roxbury", series: "Race", type: "MBTA", "White Alone": 0.345771672, "Black Alone": 0.449974987, "Asian Alone": 0.131073229, "Other Races": 0.141764568 },
        { region: "Roxbury", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.47515276, "1 Vehicle": 0.386704083, "2 Vehicles": 0.116632967, "3+ Vehicles": 0.02151019 },
        { region: "South Boston", series: "Race", type: "MBTA", "White Alone": 0.615758523, "Black Alone": 0.201217693, "Asian Alone": 0.112656695, "Other Races": 0.127194145 },
        { region: "South Boston", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.37986031, "1 Vehicle": 0.443126464, "2 Vehicles": 0.150663998, "3+ Vehicles": 0.026349229 },
        { region: "South Boston Waterfront", series: "Race", type: "MBTA", "White Alone": 0.582268211, "Black Alone": 0.232842074, "Asian Alone": 0.148436367, "Other Races": 0.087077764 },
        { region: "South Boston Waterfront", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.360087301, "1 Vehicle": 0.396497951, "2 Vehicles": 0.194622949, "3+ Vehicles": 0.0487918 },
        { region: "South End", series: "Race", type: "MBTA", "White Alone": 0.535701015, "Black Alone": 0.271760669, "Asian Alone": 0.147456876, "Other Races": 0.139157408 },
        { region: "South End", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.449078317, "1 Vehicle": 0.395955368, "2 Vehicles": 0.146013246, "3+ Vehicles": 0.008953068 },
        { region: "West End", series: "Race", type: "MBTA", "White Alone": 0.589560562, "Black Alone": 0.179214432, "Asian Alone": 0.180772679, "Other Races": 0.130517899 },
        { region: "West End", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.405886224, "1 Vehicle": 0.352657586, "2 Vehicles": 0.193637556, "3+ Vehicles": 0.047818633 },
        { region: "West Roxbury", series: "Race", type: "MBTA", "White Alone": 0.218156925, "Black Alone": 0.696474594, "Asian Alone": 0.046116114, "Other Races": 0.120218777 },
        { region: "West Roxbury", series: "Vehicles per Household", type: "MBTA", "No Access to a Vehicle": 0.416538366, "1 Vehicle": 0.36972599, "2 Vehicles": 0.172324837, "3+ Vehicles": 0.041410807 }
      ];

    const censusData = rawData.filter(d => d.type === "Census");
    const mbtaData = rawData.filter(d => d.type === "MBTA");

    document.addEventListener("regionSelected", function (e) {
        const selectedRegions = e.detail;
        updateChart(selectedRegions); // Use the existing updateChart function
    });

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
        .select("#stacked-bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip div
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip") // Ensure it's styled properly
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Keys for stacking
    const seriesKeys = {
        Age: ["0-17 years old", "18-34 years old", "35+ years old"],
        Race: ["White Alone", "Black Alone", "Asian Alone", "Other Races"],
        "Vehicles per Household": ["No Access to a Vehicle", "1 Vehicle", "2 Vehicles", "3+ Vehicles"],
    };

    let currentSeries = "Age"; // Default series
    let keys = seriesKeys[currentSeries]; // Default keys

    document.getElementById("age-btn").addEventListener("click", () => {
        currentSeries = "Age";
        keys = seriesKeys[currentSeries];
        updateChart(censusData.map(d => d.region)); // Re-render chart
        updateLegend();
    });

    document.getElementById("race-btn").addEventListener("click", () => {
        currentSeries = "Race";
        keys = seriesKeys[currentSeries];
        updateChart(censusData.map(d => d.region)); // Re-render chart
        updateLegend();
    });

    document.getElementById("vehicles-btn").addEventListener("click", () => {
        currentSeries = "Vehicles per Household";
        keys = seriesKeys[currentSeries];
        updateChart(censusData.map(d => d.region)); // Re-render chart
        updateLegend();
    });

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.2).domain(["Selected Regions"]); // Single bar
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]); // Fixed Y-Axis domain [0, 100]
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Add axes
    const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
    const yAxis = svg.append("g");

    // Function to aggregate and normalize data
    function aggregateData(selectedRegions, dataset) {
        if (selectedRegions.length === 0) return null;

        // Filter dataset by the current series. ADDEDDDDD
        const filteredData = dataset.filter(d => d.series === currentSeries);
        // Aggregate values for the selected keys
        const aggregated = keys.reduce((acc, key) => {
            acc[key] = selectedRegions.reduce(
                (sum, region) => sum + (filteredData.find(d => d.region === region)?.[key] || 0),
                0
            );
            return acc;
        }, {});

        // Calculate total population
        const totalPopulation = Object.values(aggregated).reduce((sum, value) => sum + value, 0);
    
        // Normalize to percentages
        return keys.map(key => ({
            key,
            percentage: (aggregated[key] / totalPopulation) * 100,
            breakdown: selectedRegions.map(region => ({
                region,
                population: dataset.find(d => d.region === region)[key],
            })),
        }));
    }

    // Function to update the chart
    function updateChart(selectedRegions) {
        const aggregatedCensus = aggregateData(selectedRegions, censusData);
        const aggregatedMBTA = aggregateData(selectedRegions, mbtaData);
    
        if (!aggregatedCensus || !aggregatedMBTA) {
            svg.selectAll(".layer").remove();
            xAxis.call(d3.axisBottom(xScale));
            yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
            return;
        }
    
        // Combine Census and MBTA data into a single array
        const combinedData = {
            Census: aggregatedCensus.reduce((acc, d) => {
                acc[d.key] = d.percentage;
                return acc;
            }, {}),
            MBTA: aggregatedMBTA.reduce((acc, d) => {
                acc[d.key] = d.percentage;
                return acc;
            }, {}),
        };
    
        const stackedData = d3.stack().keys(keys)([
            combinedData.Census,
            combinedData.MBTA,
        ]);
    
        // Update x-axis domain
        xScale.domain(["Census", "MBTA"]);
        xAxis.call(d3.axisBottom(xScale));
        yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
    
        // Bind data to layers
        const layers = svg.selectAll(".layer").data(stackedData);
    
        const newLayers = layers
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => colorScale(d.key));
    
        layers.merge(newLayers)
            .each(function (layerData, layerIndex) {
                const layer = d3.select(this);
    
                const rects = layer.selectAll("rect").data(layerData);
    
                rects
                    .enter()
                    .append("rect")
                    .merge(rects)
                    .attr("x", (d, i) => xScale(["Census", "MBTA"][i]))
                    .attr("y", d => (d[1] !== undefined ? yScale(d[1]) : yScale(0))) // Safeguard against undefined values
                    .attr("height", d => (d[0] !== undefined && d[1] !== undefined ? yScale(d[0]) - yScale(d[1]) : 0)) // Prevent NaN height
                    .attr("width", xScale.bandwidth())
                    .on("mouseover", function (d, i) {
                        const ageCategory = keys[layerIndex];
                        const percentage = ((d[1] - d[0]) || 0).toFixed(2); // Avoid NaN%

                        // Ensure breakdown is valid
                        const breakdown = combinedData[["Census", "MBTA"][i]]?.breakdown || [];

                        // Build and display the tooltip content
                        const tooltipContent = `
                            <strong>Age Group:</strong> ${ageCategory}<br>
                            <strong>Percentage:</strong> ${percentage}%<br>
                        `;

                        tooltip
                            .html(tooltipContent)
                            .style("visibility", "visible")
                            .style("top", `${d3.event.pageY + 10}px`)
                            .style("left", `${d3.event.pageX + 10}px`);
                    })
                    .on("mousemove", function () {
                        // Dynamically position the tooltip near the cursor
                        tooltip
                            .style("top", `${d3.event.pageY + 10}px`)
                            .style("left", `${d3.event.pageX + 10}px`);
                    })
                    .on("mouseout", function () {
                        // Hide the tooltip when the mouse leaves the bar
                        tooltip.style("visibility", "hidden");
                    });

                rects.exit().remove();
            });
    
        layers.exit().remove();
    }

    // Initial chart rendering with all regions
    updateChart(censusData.map(d => d.region));

    function updateLegend() {
        // Remove any existing legend items
        svg.select(".legend").remove();
    
        // Append a new legend container
        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(50, ${height + 30})`); // Position the legend below the chart
    
        // Bind the keys array to legend items
        const legendItems = legend
            .selectAll(".legend-item")
            .data(keys)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 120}, 0)`); // Adjust horizontal spacing
    
        // Append color rectangles for the legend
        legendItems
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => colorScale(d));
    
        // Append text labels to the legend
        legendItems
            .append("text")
            .attr("x", 20) // Space the text from the rectangle
            .attr("y", 12) // Align text vertically with the rectangle
            .text(d => d)
            .style("font-size", "12px")
            .style("fill", "black");
    }

    // Append a legend container group to the SVG
    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(50, ${height + 30})`); // Position the legend below the chart

    // Bind the keys array to legend items
    const legendItems = legend
        .selectAll(".legend-item")
        .data(keys)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 120}, 0)`); // Adjust horizontal spacing

    // Append color rectangles for the legend
    legendItems
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    // Append text labels to the legend
    legendItems
        .append("text")
        .attr("x", 20) // Space the text from the rectangle
        .attr("y", 12) // Align text vertically with the rectangle
        .text(d => d)
        .style("font-size", "12px")
        .style("fill", "black");
});
