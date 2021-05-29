// Configure the Google Cloud provider
provider "google" {
 credentials = file("my-project-1510933246375-ca76d762d849.json")
 project     = "my-project-1510933246375"
 region      = "us-east1"
}

// Terraform plugin for creating random ids
resource "random_id" "instance_id" {
 byte_length = 8
}

// A single Compute Engine instance
resource "google_compute_instance" "default" {
 name         = "node-vm-${random_id.instance_id.hex}"
 machine_type = "f1-micro"
 zone         = "us-east1-b"

 boot_disk {
   initialize_params {
     image = "debian-cloud/debian-9"
   }
 }

// Make sure flask is installed on all new instances for later steps
 metadata_startup_script = "sudo apt-get update; sudo apt-get install node; npm install express node-fetch"

 network_interface {
   network = "default"

   access_config {
     // Include this section to give the VM an external ip address
   }
 }

 metadata = {
   ssh-keys = "khooks3:${file("~/.ssh/id_rsa.pub")}"
 }
}

resource "google_compute_firewall" "default" {
 name    = "node-app-firewall"
 network = "default"

 allow {
   protocol = "tcp"
   ports    = ["3000"]
 }
}

output "ip" {
 value = google_compute_instance.default.network_interface.0.access_config.0.nat_ip
}