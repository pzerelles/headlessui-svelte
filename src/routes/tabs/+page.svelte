<script lang="ts">
  import TabGroup from "$lib/tabs/TabGroup.svelte"
  import TabList from "$lib/tabs/TabList.svelte"
  import Tab from "$lib/tabs/Tab.svelte"
  import TabPanels from "$lib/tabs/TabPanels.svelte"
  import TabPanel from "$lib/tabs/TabPanel.svelte"

  const categories = [
    {
      name: "Recent",
      posts: [
        {
          id: 1,
          title: "Does drinking coffee make you smarter?",
          date: "5h ago",
          commentCount: 5,
          shareCount: 2,
        },
        {
          id: 2,
          title: "So you've bought coffee... now what?",
          date: "2h ago",
          commentCount: 3,
          shareCount: 2,
        },
      ],
    },
    {
      name: "Popular",
      posts: [
        {
          id: 1,
          title: "Is tech making coffee better or worse?",
          date: "Jan 7",
          commentCount: 29,
          shareCount: 16,
        },
        {
          id: 2,
          title: "The most innovative things happening in coffee",
          date: "Mar 19",
          commentCount: 24,
          shareCount: 12,
        },
      ],
    },
    {
      name: "Trending",
      posts: [
        {
          id: 1,
          title: "Ask Me Anything: 10 answers to your questions about coffee",
          date: "2d ago",
          commentCount: 9,
          shareCount: 5,
        },
        {
          id: 2,
          title: "The worst advice we've ever heard about coffee",
          date: "4d ago",
          commentCount: 1,
          shareCount: 2,
        },
      ],
    },
  ]
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="w-full max-w-md">
    <TabGroup>
      <TabList class="flex gap-4">
        {#each categories as { name } (name)}
          <Tab
            class="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:outline-none data-[hover]:bg-white/5 data-[selected]:bg-white/10 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
          >
            {name}
          </Tab>
        {/each}
      </TabList>
      <TabPanels class="mt-3">
        {#each categories as { name, posts } (name)}
          <TabPanel class="rounded-xl bg-white/5 p-3">
            <ul>
              {#each posts as post (post.id)}
                <li class="relative rounded-md p-3 text-sm/6 transition hover:bg-white/5">
                  <a href="." class="font-semibold text-white">
                    <span class="absolute inset-0"></span>
                    {post.title}
                  </a>
                  <ul class="flex gap-2 text-white/50" aria-hidden="true">
                    <li>{post.date}</li>
                    <li aria-hidden="true">&middot;</li>
                    <li>{post.commentCount} comments</li>
                    <li aria-hidden="true">&middot;</li>
                    <li>{post.shareCount} shares</li>
                  </ul>
                </li>
              {/each}
            </ul>
          </TabPanel>
        {/each}
      </TabPanels>
    </TabGroup>
  </div>
</div>
