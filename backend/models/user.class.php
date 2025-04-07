<?php

class User {

    public $email;
    public $firstname;
    public $lastname;
    public $username;
    public $password;
    public $confirmPassword;
    public $salutation;

    
    public function __construct(string $email, string $firstname, string $lastname, string $username, string $password, string $salutation) {
        $this->email         = $email;
        $this->firstname = $firstname;
        $this->lastname  = $lastname;
        $this->username  = $username;
        $this->password   = $password;
        $this->salutation  = $salutation;
    }
}

