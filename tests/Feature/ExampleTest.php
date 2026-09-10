<?php

it('redirects unauthenticated root visit to login', function () {
    $response = $this->get('/');

    $response->assertRedirect('/login');
});
