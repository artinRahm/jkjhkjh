function sortGameButtons() {
  const gameGrid = document.getElementById('gameGrid');
  const gameButtons = Array.from(gameGrid.querySelectorAll('.game-button'));

  gameButtons.sort((a, b) => {
    const imgA = a.querySelector('img');
    const imgB = b.querySelector('img');
    const altA = imgA ? imgA.alt : '';
    const altB = imgB ? imgB.alt : '';
    return altA.localeCompare(altB);
  });

  gameButtons.forEach(button => gameGrid.appendChild(button));
}
