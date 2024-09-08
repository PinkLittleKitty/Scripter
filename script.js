let sceneNumber = 1;
let lastFocusedBlock = null;
let blocks = [];

function createNewBlock() {
    const blockContainer = document.createElement('div');
    blockContainer.className = 'block-container';

    const newBlock = document.createElement('textarea');
    newBlock.className = 'script-block';
    newBlock.rows = 1;
    newBlock.style.width = 'calc(100% - 5em)'; // Add this line
    newBlock.addEventListener('input', () => adjustHeight(newBlock));
    newBlock.addEventListener('keydown', handleKeyDown);
    newBlock.addEventListener('focus', () => {
        lastFocusedBlock = newBlock;
        updateGlobalTagSelector(newBlock);
    });

    blockContainer.appendChild(newBlock);

    // Find the index of the current block
    const currentIndex = blocks.indexOf(lastFocusedBlock);

    if (currentIndex !== -1 && currentIndex < blocks.length - 1) {
        // Insert the new block after the current block
        const nextBlock = blocks[currentIndex + 1];
        nextBlock.parentNode.insertBefore(blockContainer, nextBlock);
        blocks.splice(currentIndex + 1, 0, newBlock);
    } else {
        // If it's the last block or no block is focused, append to the end
        document.getElementById('scriptContainer').appendChild(blockContainer);
        blocks.push(newBlock);
    }

    newBlock.focus();
}

function adjustHeight(element) {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        createNewBlock();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    createNewBlock(); // Create the first block

    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.innerHTML = `
          <div class="sidebar-header">
              <h1>Scripter</h1>
          </div>
          <nav id="menuContent">
              <button id="saveButton">Save</button>
              <button id="loadButton">Load</button>
          </nav>
      `;
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Create arrow button
    const arrowButton = document.createElement('button');
    arrowButton.id = 'arrowButton';
    arrowButton.innerHTML = '←';
    document.body.appendChild(arrowButton);

    // Create and add the global tag selector
    const globalTagSelector = document.createElement('select');
    globalTagSelector.id = 'globalTagSelector';
    globalTagSelector.className = 'tag-selector';
    const tags = ['Scene', 'Action', 'Character', 'Dialogue', 'Stage Direction', 'Transition', 'Sequence', 'Chapter', 'Title', 'Text'];
    tags.forEach((tag, index) => {
        const option = document.createElement('option');
        option.value = tag.toLowerCase();
        option.textContent = `${index + 1}. ${tag}`;
        globalTagSelector.appendChild(option);
    });

    // Insert the dropdown before the script container
    const scriptContainer = document.getElementById('scriptContainer');
    scriptContainer.parentNode.insertBefore(globalTagSelector, scriptContainer);

    // Add event listeners
    document.getElementById('arrowButton').addEventListener('click', toggleSidebar);
    document.getElementById('saveButton').addEventListener('click', saveScript);
    document.getElementById('loadButton').addEventListener('click', loadScript);
    document.getElementById('globalTagSelector').addEventListener('change', () => {
        applyTagFormatting();
        if (lastFocusedBlock) {
            lastFocusedBlock.focus();
        }
    });

    document.addEventListener('keydown', handleGlobalKeyDown);

    // Add CSS for sidebar and menu
    const style = document.createElement('style');
    style.textContent = `
          #sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: 200px;
              height: 100%;
              background-color: #f1f1f1;
              padding: 20px;
              box-shadow: 2px 0 5px rgba(0,0,0,0.1);
              transition: transform 0.3s ease-in-out;
          }
          .sidebar-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          #menuContent {
              margin-top: 20px;
          }
          #menuContent button {
              display: block;
              width: 100%;
              margin-bottom: 10px;
              padding: 10px;
              background-color: #4CAF50;
              color: white;
              border: none;
              cursor: pointer;
              transition: background-color 0.3s;
          }
          #menuContent button:hover {
              background-color: #45a049;
          }
          #sidebar.hidden {
              transform: translateX(-200px);
          }
          #arrowButton {
              position: fixed;
              left: 200px;
              top: 20px;
              background: #f1f1f1;
              border: none;
              font-size: 24px;
              cursor: pointer;
              padding: 5px 10px;
              transition: left 0.3s ease-in-out;
              z-index: 1000;
          }
          #sidebar.hidden + #arrowButton {
              left: 0;
          }
          #sidebar.hidden + #arrowButton::after {
              content: '→';
          }
          @media (max-width: 600px) {
              #sidebar {
                  width: 100%;
              }
          }
      `;
    style.textContent += `
      #globalTagSelector {
          display: block;
          margin: 10px auto;
          padding: 5px;
          font-size: 14px;
      }
      .tag-selector {
          margin-bottom: 5px;
      }
      .script-block {
          width: 100%;
          font-family: 'Courier New', monospace;
          font-size: 12pt;
          margin-bottom: 0;
      }
      .tag-scene {
          text-align: left;
          text-transform: uppercase;
      }
      .tag-action {
          text-align: left;
      }
      .tag-character {
          text-align: center;
          text-transform: uppercase;
      }
      .tag-dialogue {
          text-align: left;
          padding-left: 2em;
          margin-top: 0;
      }
      .tag-stage-direction {
          text-align: left;
          padding-left: 3em;
          margin-top: 0;
      }
      .tag-transition {
          text-align: right;
          text-transform: uppercase;
      }
      .tag-sequence {
          text-align: left;
      }
      .tag-chapter {
          text-align: center;
      }
      .tag-title {
          text-align: center;
          margin-top: 0;
      }    }`;
    document.head.appendChild(style);
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const arrowButton = document.getElementById('arrowButton');
    sidebar.classList.toggle('hidden');
    arrowButton.innerHTML = sidebar.classList.contains('hidden') ? '→' : '←';
}

function saveScript() {
    const content = blocks.map(block => {
        const tag = block.className.split(' ').find(cls => cls.startsWith('tag-'))?.split('-')[1] || 'default';
        return `${tag}:${block.value}`;
    }).join('\n');
    localStorage.setItem('screenplay', content);
    alert('Script saved!');
}

function loadScript() {
    const content = localStorage.getItem('screenplay');
    if (content) {
        const blockContents = content.split('\n');
        document.getElementById('scriptContainer').innerHTML = '';
        blocks = [];
        sceneNumber = 1; // Reset scene number
        blockContents.forEach(blockContent => {
            const [tag, text] = blockContent.split(':');
            createNewBlock();
            const lastBlock = blocks[blocks.length - 1];
            lastBlock.value = text;
            applyTagFormatting(lastBlock, tag);
            adjustHeight(lastBlock);
            
            // Update scene number if this is a scene block
            if (tag.toLowerCase() === 'scene') {
                sceneNumber++;
            }
        });
        updateSceneNumbers();
        alert('Script loaded!');
    } else {
        alert('No saved script found.');
    }
}
function createTagSelector() {
    const selector = document.createElement('select');
    selector.className = 'tag-selector';
    const tags = ['Default', 'Character', 'Dialogue', 'Action', 'Transition'];
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.toLowerCase();
        option.textContent = tag;
        selector.appendChild(option);
    });
    return selector;
}

function applyTagFormatting() {
    if (lastFocusedBlock) {
        const tag = document.getElementById('globalTagSelector').value;
        const previousTag = lastFocusedBlock.className.split(' ').find(cls => cls.startsWith('tag-'))?.split('-')[1];

        // Remove parentheses if changing from stage direction
        if (lastFocusedBlock.classList.contains('tag-stage-direction')) {
            lastFocusedBlock.value = lastFocusedBlock.value.replace(/^\(|\)$/g, '');
        }

        // Remove scene number if changing from scene to another tag
        if (previousTag === 'scene' && tag.toLowerCase() !== 'scene') {
            lastFocusedBlock.value = lastFocusedBlock.value.replace(/^\d+\.\s*/, '');
        }

        // Reset all styles
        lastFocusedBlock.style = '';
        lastFocusedBlock.className = 'script-block';
        lastFocusedBlock.classList.add(`tag-${tag.toLowerCase().replace(' ', '-')}`);

        switch (tag.toLowerCase()) {
            case 'scene':
                lastFocusedBlock.style.textAlign = 'left';
                lastFocusedBlock.style.textTransform = 'uppercase';
                lastFocusedBlock.style.paddingLeft = '5em';
                lastFocusedBlock.style.backgroundColor = '#C7C4CC';
                lastFocusedBlock.style.fontWeight = 'bold';
                lastFocusedBlock.style.width = 'calc(100% - 5em)';
                break;
            case 'action':
                lastFocusedBlock.style.textAlign = 'left';
                lastFocusedBlock.style.paddingLeft = '5em';
                lastFocusedBlock.style.width = 'calc(100% - 5em)';
                break;
            case 'character':
                lastFocusedBlock.style.textAlign = 'left';
                lastFocusedBlock.style.textTransform = 'uppercase';
                lastFocusedBlock.style.paddingLeft = '18em';
                lastFocusedBlock.style.width = 'calc(100% - 18em)';
                break;
            case 'dialogue':
                lastFocusedBlock.style.textAlign = 'left';
                lastFocusedBlock.style.paddingLeft = '11em';
                lastFocusedBlock.style.marginTop = '0';
                lastFocusedBlock.style.width = 'calc(100% - 11em)';
                break;
            case 'stage direction':
                lastFocusedBlock.style.textAlign = 'left';
                lastFocusedBlock.style.paddingLeft = '14em';
                lastFocusedBlock.style.marginTop = '0';
                lastFocusedBlock.style.width = 'calc(100% - 14em)';
                if (lastFocusedBlock.value.trim() === '') {
                    lastFocusedBlock.value = '()';
                    // Set cursor position between parentheses
                    lastFocusedBlock.setSelectionRange(1, 1);
                } else if (!lastFocusedBlock.value.startsWith('(') && !lastFocusedBlock.value.endsWith(')')) {
                    lastFocusedBlock.value = `(${lastFocusedBlock.value})`;
                }
                break;
            case 'transition':
                lastFocusedBlock.style.textAlign = 'right';
                lastFocusedBlock.style.textTransform = 'uppercase';
                break;
            case 'sequence':
                lastFocusedBlock.style.textAlign = 'left';
                break;
            case 'chapter':
                lastFocusedBlock.style.textAlign = 'center';
                break;
            case 'title':
                lastFocusedBlock.style.textAlign = 'center';
                lastFocusedBlock.style.marginTop = '0';
                break;
            case 'text':
                break;
        }

        // Update scene numbers if the tag was changed to or from 'scene'
        if (tag.toLowerCase() === 'scene' || previousTag === 'scene') {
            updateSceneNumbers();
        }
    }
}function updateGlobalTagSelector(block) {
    const globalTagSelector = document.getElementById('globalTagSelector');
    const tag = block.className.split(' ').find(cls => cls.startsWith('tag-'))?.split('-')[1] || 'default';
    globalTagSelector.value = tag;
}

function handleGlobalKeyDown(event) {
    if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        const globalTagSelector = document.getElementById('globalTagSelector');
        if (index < globalTagSelector.options.length) {
            globalTagSelector.selectedIndex = index;
            applyTagFormatting();
            if (lastFocusedBlock) {
                lastFocusedBlock.focus();
            }
        }
    }
}

function updateSceneNumbers() {
    let currentSceneNumber = 1;
    blocks.forEach(block => {
        if (block.classList.contains('tag-scene')) {
            const sceneText = block.value.replace(/^\d+\.\s*/, '');
            block.value = `${currentSceneNumber++}. ${sceneText}`;
        } else {
            // Preserve scene numbers in non-scene blocks
            const match = block.value.match(/^(\d+\.\s*)(.*)/);
            if (match) {
                block.value = match[2]; // Keep the text without the number
                currentSceneNumber = parseInt(match[1]) + 1; // Update the scene counter
            }
        }
    });
}