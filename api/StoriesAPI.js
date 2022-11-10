import BaseAPI from '@/api/BaseAPI'

export default class StoriesAPI extends BaseAPI {
  fetchv2(id) {
    return this.$getv2('/story/' + id)
  }

  async add(data) {
    const { id } = await this.$put('/stories', data)
    return id
  }

  love(id) {
    return this.$post('/stories', { id, action: 'Like' })
  }

  unlove(id) {
    return this.$post('/stories', { id, action: 'Unlike' })
  }

  dontUseForPublicity(id) {
    return this.$patch('/stories', { id, reviewed: 1, public: 0 })
  }

  useForPublicity(id) {
    return this.$patch('/stories', { id, reviewed: 1, public: 1 })
  }

  useForNewsletter(id) {
    return this.$patch('/stories', { id, newsletterreviewed: 1, newsletter: 1 })
  }

  dontUseForNewsletter(id) {
    return this.$patch('/stories', { id, newsletterreviewed: 1, newsletter: 0 })
  }
}
