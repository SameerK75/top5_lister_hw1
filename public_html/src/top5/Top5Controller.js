/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
            this.model.clearStatusBar();
            this.model.fillStatusBar();
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.unselectAll();
            this.model.view.clearWorkspace();
            this.model.clearStatusBar();
            this.model.currentList = null;
            this.model.tps.clearAllTransactions();
            this.model.view.updateToolbarButtons(this.model);
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                    }
                }
            }
             //ADD DRAG AND DROP FUNCTIONALITY
             item.draggable = true;
             item.ondragover = (event) => {
                event.preventDefault(); 
             }
             item.ondragstart = (event) => {
                 event.dataTransfer.setData("text", event.target.id)
             }
             item.ondrop = (event) => {
                 event.preventDefault();
                 let droppedID = event.dataTransfer.getData("text");
                 let droppedOnID = event.target.id;
                 let index1 = droppedID.charAt(5);
                 let index2 = droppedOnID.charAt(5);
                 //this.model.dragAndDrop(index1, index2);
                 this.model.addMoveItemTransaction(index1 - 1, index2 - 1);
                 this.model.view.updateToolbarButtons(this.model);       
             }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);

            // SHOW LIST IN STATUS BAR AND CLEAR ANY PREVIOUS LIST
            this.model.clearStatusBar();
            this.model.fillStatusBar();
        }

        // FOR HIGHLIGHTING LIST ON MOUSE OVER
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            this.model.mouseOverHighlight(id);
        }

        document.getElementById("top5-list-" + id).onmouseout = (event) => {
            this.model.mouseOutHighlight(id);
        }

        // FOR EDITING LIST NAME
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            let listTitle = document.getElementById("list-card-text-" + id);
            listTitle.innerHTML = "";

            //ADD TEXT FIELD 
            let listText = document.createElement("input");
            listText.setAttribute("type", "text");
            listText.setAttribute("id", "list-text-input-" + id)
            listText.setAttribute("value", this.model.currentList.getName())

            listTitle.appendChild(listText);

            listText.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            listText.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    this.model.changeListTitle(event.target.value, id);
                    this.model.clearStatusBar();
                    this.model.fillStatusBar();
                }
            }
            listText.onblur = (event) => {
                this.model.changeListTitle(event.target.value, id);
                this.model.clearStatusBar();
                this.model.fillStatusBar();
            }

            
            
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = this.model.getListIndex(id);
            let listName = this.model.getList(this.listToDeleteIndex).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            // FOR CONFIRMING DELETE
            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                this.model.deleteList(this.listToDeleteIndex); 
                modal.classList.remove("is-visible");
            }
            // FOR CANCELLING DELETE
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}