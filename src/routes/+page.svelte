<script>
    import { Header, Footer, StateSummary } from '$components';
    import logoIcon from '$lib/assets/logo/stub_the_stubble_icon.svg';
</script>



<Header />
<div class="container my-12">
    <div class="w-full xl:w-5/6 mx-auto">
        <div class="mb-0">
            <div class="flex gap-2 xs:gap-4 items-end mb-4">
                <img
                    width="16"
                    height="50"
                    class="w-4 xs:w-5 sm:w-6"
                    src={logoIcon}
                    alt="Stub the Stubble logo"
                />
                <h1 class="text-4xl xs:text-5xl sm:text-6.5xl">Stub The Stubble</h1>
            </div>
            <h2 class="text-lg xs:text-2xl max-w-prose">
                Stub the Stubble is a platform to understand the problems and solutions related to
                stubble burning in India.
            </h2>
        </div>
        <div class="md:grid md:grid-cols-2 md:gap-20">
            <StateSummary state_code="PB" layout="narrow" />
            <StateSummary state_code="HR" layout="narrow" />
        </div>
    </div>
</div>
<Footer />
