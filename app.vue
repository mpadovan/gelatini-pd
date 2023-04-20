<script>
export default {
  data () {
    return {
      scraperStatus: 'enabled'
    }
  },
  methods: {
    fetchProducts: async function () {
      this.scraperStatus = 'disabled'
      // eslint-disable-next-line no-undef
      $fetch('/api/scraper')
        .then(event => {
          this.scraperStatus = 'enabled'
        })
    }
  }
}
</script>

<template>
  <div>
    <button @click="$event => fetchProducts()" v-bind:disabled="scraperStatus === 'disabled'"> Fetch Products</button>
  </div>
</template>
