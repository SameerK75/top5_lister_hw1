import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js";

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }

    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA.getName() < listB.getName()) {
                return -1;
            }
            else if (listA.getName === listB.getName()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.top5Lists);
        this.saveLists();
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(list.id);
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        let previousCurrentList;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                previousCurrentList = this.currentList;
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(list.id);
                found = true;
            }
            i++;
        }
        if(previousCurrentList != null && previousCurrentList.id !== this.currentList.id ) {
            this.tps.clearAllTransactions(); 
        }
        //this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            this.view.updateToolbarButtons(this);
            return true;
        }        
    }

    saveLists() {
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    changeListTitle(newTitle, id) {
        if(newTitle == "") {
            newTitle = "Untitled";
        }
        let changingList = this.getList(this.getListIndex(id));
        changingList.setName(newTitle);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        this.saveLists();
        this.view.highlightList(changingList.id);
    }

    deleteList(deleteIndex) {
        let deletingList = this.getList(deleteIndex);
        let keepCurrentList;
        if(this.currentList !== null && this.currentList.id === deletingList.id) {
            this.top5Lists.splice(deleteIndex, 1);
            this.view.refreshLists(this.top5Lists);
            this.saveLists();
            this.clearStatusBar();
            this.view.clearWorkspace();
            this.currentList = null;
        }
        else {
            keepCurrentList = this.currentList;
            this.top5Lists.splice(deleteIndex, 1);
            this.view.refreshLists(this.top5Lists);
            this.saveLists();
            if(keepCurrentList !== null) {
                this.view.highlightList(keepCurrentList.id);
            }
        }

    }

    mouseOverHighlight(id) {
            let listCard = document.getElementById("top5-list-" + id);
            listCard.classList.add("mouseOver-list-card");
    }

    mouseOutHighlight(id) {
        let listCard = document.getElementById("top5-list-" + id);
        listCard.classList.remove("mouseOver-list-card");
    }

    fillStatusBar() {
       let listName = this.currentList.getName();
       let statusBar = document.getElementById("top5-statusbar");
       statusBar.appendChild(document.createTextNode("Top 5 " + listName));
    }
    
    clearStatusBar() {
        let statusBar = document.getElementById("top5-statusbar");
        statusBar.innerHTML = "";
    }

    addMoveItemTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
    }

    moveItem(oldIndex, newIndex) {
        this.currentList.moveItem(oldIndex, newIndex);
        this.view.update(this.currentList);
        this.saveLists();
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }

    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }
}