Vue.component('resource-item', {
  template: '\
  <tr>\
      <td>{{ title }}</td>\
      <td><input class="text-center" v-on:input="updatePercent($event.target.value)" :disabled="mode !== \'percent\'" v-model="percentage"></td> \
      <td><input type="number" class="text-center" v-on:input="updateCards($event.target.value)" :disabled="mode !== \'count\'" v-model="count">\
     <div class="form-group" :hidden="mode !== \'percent\'">\
      <input type="radio" v-on:change="assignLeftovers()" :value="assigned" :name="assigned">\
      <label for="assign">Assign Remainder</label>\
        </div>\
  </td> \
      <td><input type="number" class="text-center" v-on:input="updateValues($event.target.value)" v-model="cardvalue"></td> \
      <td><button class="btn btn-danger" v-on:click="remove()">Remove</button> </td>\
  </tr>\
  ',
  props: ['id', 'title', 'percentage', 'count', 'cardvalue', 'mode', 'index', 'assigned'],
  methods: {
    updatePercent: function (p) {
      this.$emit('percent-input', {p:p, id:this.id});
    },
    updateCards: function(c) {
        this.$emit('card-input', {c:c, id:this.id});
    },
    updateValues: function(v) {
        this.$emit('value-input', {v:v, id:this.id});
    },
    remove: function() {
        this.$emit('remove', {index:this.index});
    },
    assignLeftovers: function() {
      this.$emit('assign-leftovers', {id:this.id});
    },
  }
})

var vm = new Vue({
  el: '#app',
  data: {
    newResource: '',
    mode: 'percent',
    selectedValue: "1",
    resources: [
    {
        id: 1,
        title: 'Wood',
        percentage: 0,
        count: 0,
        value: 0
    },
      {
        id: 2,
        title: 'Stone',
        percentage: 0,
        count: 0,
        value: 0
      },
      {
        id: 3,
        title: 'Steel',
        percentage: 0,
        count: 0,
        value: 0
      }
    ],
    nextResourceId: 4,
    totalCardCount : 0,
    currentAverageValue: 0,
    currentPercentage: 0,
    currentTotalCards: 0,
    currentRemainder: 0
  }, 
  computed: {
    validPercent: function() {
      return this.currentPercentage == 100;
    },
    validCount: function() {
      return this.currentTotalCards == this.totalCardCount;
    }
  },
  methods: {
    retotal: function() {
      this.currentRemainder = 0;
      
        if(this.mode === 'percent') {
          this.calculatePercent();
        }
        else if(this.mode === 'count') {
          this.calculateCount();
        }
    },
    assignLeftovers : function (args) {
      this.selectedValue = args.id;
    },
    calculatePercent: function () {
      if(this.validPercent === true) {
        var onePercent = this.totalCardCount/100;
        var runningCount = 0;
        
        for (var i = 0; i < this.resources.length; i++) {
            var c = Math.floor(onePercent * this.resources[i].percentage);
            runningCount += c;
            Vue.set(this.resources[i], 'count', c);        
        }
        this.currentRemainder = this.totalCardCount - runningCount;
        
        for (var i = 0; i < this.resources.length; i++) {
          if(this.resources[i].id === this.selectedValue) {
              var originalCount = this.resources[i].count;
              Vue.set(this.resources[i], 'count', originalCount + this.currentRemainder);  
              this.currentRemainder = 0;
            }
          }
        }
      else{
        alert('The total percentage must equal 100% when using percentage mode.');
      }
      
      recalculate(null);
    },
    calculateCount : function () {
      if(this.validCount === true) {
        var percentPerCard = 100/this.totalCardCount;
        
        for (var i = 0; i < this.resources.length; i++) {
            var p = percentPerCard * this.resources[i].count;
            Vue.set(this.resources[i], 'percentage', p);     
          }
      }
      else{
        alert('The total count must equal the total card count when using count mode.');
      }
      
      recalculate(null);
    },
    addNewResource: function () {
      this.resources.push({
        id: this.nextResourceId++,
        title: this.newResource,
        percentage: 0,
        count: 0,
        value: 0
      })
      this.newResource = ''
    },
    recalculate: function (args) {
      if(args !== null) {
          this.resources.splice(args.index, 1);
      }
      
      var sum = 0;
      var perSum = 0;
      var carSum = 0;
      var iterator = 0;
      
      for (var i = 0; i < this.resources.length; i++) {
        iterator++;        
        sum += this.resources[i].value;
        perSum += this.resources[i].percentage;
        carSum += this.resources[i].count;
      }
      
     this.currentPercentage = perSum;
     this.currentAverageValue = sum/iterator;  
     this.currentTotalCards = carSum;  
    },
    calculateCurrentPercentage: function (args) {      
      var perSum = 0;
      
      for (var i = 0; i < this.resources.length; i++) {
          if(this.resources[i].id === args.id) {
            Vue.set(this.resources[i], 'percentage', parseInt(args.p, 10));
          }
        
          perSum += this.resources[i].percentage;
      }
      
      this.currentPercentage = perSum;
    },
    calculateCurrentTotalCards: function (args) {     
      var carSum = 0;
      
      for (var i = 0; i < this.resources.length; i++) {
          if(this.resources[i].id === args.id) {
            Vue.set(this.resources[i], 'count', parseInt(args.c, 10));
          }
        
          carSum += this.resources[i].count;
      }
      
      this.currentTotalCards = carSum;  
    },
    calculateAverageValue: function (args) {     
      var sum = 0;
      var iterator = 0;
      for (var i = 0; i < this.resources.length; i++) {
        iterator++;
          if(this.resources[i].id === args.id) {
            Vue.set(this.resources[i], 'value', parseInt(args.v, 10));
          }
        
          sum += this.resources[i].value;
      }
      
      this.currentAverageValue = sum/iterator;  
    },
    download: function () {
      var jsonObject = JSON.stringify(this.resources);
      alert(jsonObject);
      this.convertToCSV(jsonObject);
    },
    download: function () {
       var csv = 'Resource,Value\n';
      for (var i = 0; i < this.resources.length; i++) {
         for(var j = 0; j < this.resources[i].count; j++) {
           csv += this.resources[i].title;
           csv += ',';
           csv += this.resources[i].value;
           csv += "\n";
         }
      }
 
      console.log(csv);
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'resources.csv';
      hiddenElement.click();
    }
  },
});




