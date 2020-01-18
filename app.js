// this app is separated into 3 modules - written in es5
// controller modules, UI module, and data Module

// modules will be IIFEs and closures

//#################################################### Module 1 - Budget Controller #####################################################################

var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // expense object prototype
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // calculate total
  var calculateTotal = function(type) {
    var sum = 0;
    // loop through each item in the type array
    data.allItems[type].forEach(function(cur) {
      // add each items value to the previous sum value!
      sum += cur.value;
    });

    // update the data structures sum totals
    data.totals[type] = sum;
  };

  // entire data structure
  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };

  // public
  return {
    addItem: function(type, des, val) {
      var newItem;

      // create new id number
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // get the last id, and add 1
      } else {
        ID = 0;
      }

      // check what type of Item is being added, and create the proper item
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // take that newly created item, and push it into the proper array in our data structure
      // the data structure is in THIS IIFE
      data.allItems[type].push(newItem);
      // return the new item now so it can be accessed directly
      return newItem;
    },

    deleteItem: function(type, id) {
      var index, ids;

      ids = data.allItems[type].map(function(current) {
        // for each item, return the id of that item (will return an array with all the ids!)
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        // calculate the % of income that we spent
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//#################################################### Module 2 - UI Controller ########################################################################

var UIController = (function() {
  // private variable to eliminate re-typing all of these strings
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    // split num
    numSplit = num.split('.')

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      if (type === "inc") {
        // get the proper classname for the container this will be inserted into
        element = DOMstrings.incomeContainer;
        // create an html string with placeholder text
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        // get the proper classname for the container this will be inserted into
        element = DOMstrings.expenseContainer;
        // create an html string with placeholder text
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace the placeholder text with actual data
      // use the .replace method for the values we need to replace
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // insert the html into the DOM (we will be using insertAdjacentHtml)
      // either income list, or expense list (element created above)
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      // select the item
      var el = document.getElementById(selectorID);
      // get the parent node of the element, and remove the child (the item)
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;
      // this returns a list, so we need to change this list to an array to get the array methods!
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      // heres a little hack using the array prototype to slice the list, creating a copy which is an actual array!
      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = ""; // each value will be cleared!
      });

      // set focus back to the input description value
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {

      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      // get a node list of all the expenses items
      // this is all of the expenses
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      // using nodelist foreach
      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;

      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    // return our private DOMstrings variable to be used in other controllers
    getDomStrings: function() {
      return DOMstrings;
    }
  };
})();

//#################################################### Module 3 - Global App Controller ########################################################################

// these will be 2 args to be set as our other 2 controllers...
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    // DOM = DOMstrings
    var DOM = UICtrl.getDomStrings();

    // click add button event listener
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    // enter key add item event listener - global
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        // call ctrlAddItem function
        ctrlAddItem();
      }
    });

    // delete item from UI on button click
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function() {
    // calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budget = budgetCtrl.getBudget();
    // display the budget on the ui
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // calculate the percentages
    budgetCtrl.calculatePercentages();
    // read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();
    // update the UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // add item to budget controller -> use the input we just created
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // add item to the ui
      UICtrl.addListItem(newItem, input.type);
      // clear the fields
      UICtrl.clearFields();
      // update budget function
      updateBudget();
      // calculate update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // split method to split the number from the type
      splitID = itemID.split("-");
      // separate items
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // delete item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // delete item from UI
      UICtrl.deleteListItem(itemID);
      // update and display new budget
      updateBudget();
      // update and show the new budget
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("The application is running...");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      // set up the event listeners so the app can work
      setupEventListeners();
      console.log("Event listeners initiated...");
    }
  };
})(budgetController, UIController);

// public initialization function
controller.init();
