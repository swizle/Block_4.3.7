const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const repositoriesList = document.getElementById('repositoriesList');

let debounceTimeout;
let selectedRepository;

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();

  autocompleteList.innerHTML = '';

  if (query === '') {
    autocompleteList.style.display = 'none';
    return;
  }

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchRepositories(query);
  }, 500);
});

async function searchRepositories(query) {
  try {
    const apiUrl = `https://api.github.com/search/repositories?q=${query}&per_page=5`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items) {
      autocompleteList.innerHTML = data.items
        .map(repo => `<li>${repo.full_name}</li>`)
        .join('');

      autocompleteList.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
}

async function getRepositoryDetails(repositoryName) {
  try {
    const apiUrl = `https://api.github.com/repos/${repositoryName}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return {
      name: data.name,
      stars: data.stargazers_count,
      owner: data.owner.login
    };
  } catch (error) {
    console.error('Error fetching repository details:', error);
  }
}

autocompleteList.addEventListener('click', (e) => {
  const target = e.target;

  if (target.tagName === 'LI') {
    const repositoryName = target.textContent;
    addRepository(repositoryName);
    searchInput.value = '';
    autocompleteList.style.display = 'none';
  }
});

async function addRepository(repositoryName) {
  const repositoryDetails = await getRepositoryDetails(repositoryName);

  if (repositoryDetails) {
    const repository = document.createElement('li');
    repository.className = 'repository';

    const name = document.createElement('a');
    name.href = `https://github.com/${repositoryName}`;
    name.textContent = `Name: ${repositoryDetails.name}`;

    const stars = document.createElement('span');
    stars.textContent = `Stars: ${repositoryDetails.stars}`;

    const owner = document.createElement('span');
    owner.textContent = `Owner: ${repositoryDetails.owner}`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      repositoriesList.removeChild(repository);
    });

    repository.appendChild(name);
    repository.appendChild(stars);
    repository.appendChild(owner);
    repository.appendChild(removeButton);
    repositoriesList.appendChild(repository);
  }
}
