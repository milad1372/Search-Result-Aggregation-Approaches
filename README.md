# Search Result Aggregation Interfaces (MERN Stack)

This project implements four search result aggregation interfaces (Tab-Based, Single List, Bento Box, and Thematic Clustering) as part of the study titled:  
**"A Study of Search Result Aggregation Approaches for the Digital Humanities"** 
 
Authored by Milad Momeni and Orland Hoeber  


## 📚 Overview

The system provides a unified search interface that aggregates results from multiple independent platforms:
- **Europeana** (Digital Humanities Archive)
- **Ex Libris Primo** (University Academic Library)
- **Wikipedia**

Users can explore different interface layouts to understand the impact of visual aggregation strategies on exploratory search tasks. The Thematic Clustering interface leverages BERT-based embeddings for semantic grouping of results.

---

## 🧰 Tech Stack

- **MERN stack**: MongoDB, Express.js, React.js, Node.js
- **APIs Used**:
  - Europeana
  - Ex Libris Primo
  - Wikipedia

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/milad1372/Search-Result-Aggregation-Approaches.git
cd Search-Result-Aggregation-Approaches
```

### 2. Configure Environment Variables

In `server/config.js`, define the following constants:

```js
module.exports = {
  Api_Key_EUROP: 'XXXX',
  Api_Key_EXLIB: 'XXXX',
  Format: 'json',
  Max_Records: 10,
  Sort_Order: 'desc',
  Sort_Field: 'article_number',
  Base_URL_For_Europeana: 'https://api.europeana.eu/record/v2/search.json?',
  DB_URI: 'mongodb+srv://admin:XXXX',
  Base_URL_For_Library: 'http://147.182.148.79/sils/api/search?',
  Base_URL_For_exlibrisgroup: 'https://api-na.hosted.exlibrisgroup.com/primo/v1/search?XXXX',
  BASE_URL_FOR_WIKIPEDIA: 'https://en.wikipedia.org/w/api.php'
};
```

Replace all `XXXX` with your actual API keys and DB credentials.

### 3. Install dependencies and run the app

#### Server

```bash
cd server
npm install
npm start
```

#### Client

Open a new terminal:

```bash
cd client
npm install
npm start
```

---

## 🧪 Interfaces Implemented

Each interface issues the same search query across platforms and aggregates the results as follows:

1. **Tab-Based**: One tab per platform
2. **Single List**: Interleaved list of results
3. **Bento Box**: Spatial groupings per source
4. **Thematic Clustering**: Semantic clusters using BERT + Agglomerative Clustering

---

## 📝 Citation

If you use this system for research or teaching, please cite:

Momeni, M., & Hoeber, O. (2025). A study of search result aggregation approaches for the digital humanities. Journal of the Association for Information Science and Technology, 1–20. [https://doi.org/10.1002/asi.70006](https://doi.org/10.1002/asi.70006)

---

## 📎 License

This project is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.  
You are free to share and adapt the material for any purpose, including commercial use, provided appropriate credit is given.

See [LICENSE.md](LICENSE.md) for details.

---

## 📫 Contact

For questions or collaboration requests, please contact:  
**Milad Momeni** – miladmomeni@uregina.ca  
University of Regina, Department of Computer Science
