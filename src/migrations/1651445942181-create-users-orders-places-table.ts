import { MigrationInterface, QueryRunner } from "typeorm";

export class createUsersOrdersPlacesTable1651445942181 implements MigrationInterface {
    name = 'createUsersOrdersPlacesTable1651445942181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'none') NOT NULL DEFAULT 'none', \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`isp\` enum ('naver', 'kakao', 'apple', 'none') NULL DEFAULT 'none', \`ispId\` varchar(255) NULL, \`profileImage\` varchar(255) NULL, \`coord\` text NULL, \`location\` point NOT NULL, INDEX \`IDX_ace513fa30d485cfd25c11a9e4\` (\`role\`), INDEX \`IDX_4c3e3d228df59494b17a273842\` (\`isp\`), INDEX \`IDX_c327f19d7924f50a243a41a747\` (\`ispId\`), SPATIAL INDEX \`IDX_15b3fe608b52f34df363512e39\` (\`location\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`driverMatchedAt\` datetime NOT NULL, \`heroMatchedAt\` datetime NOT NULL, \`heropickUpedAt\` datetime NOT NULL, \`departedAt\` datetime NOT NULL, \`loadedAt\` datetime NOT NULL, \`arrivedAt\` datetime NOT NULL, \`feeCaculatedAt\` datetime NOT NULL, \`completedAt\` datetime NOT NULL, \`driverId\` int NULL, \`heroId\` int NULL, \`clientId\` int NULL, \`departureId\` int NULL, \`arrivalId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`places\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('hospital') NOT NULL DEFAULT 'hospital', \`latitude\` double NOT NULL, \`longitude\` double NOT NULL, \`point\` point NOT NULL, SPATIAL INDEX \`IDX_0964453b430bf7f2bfc4378983\` (\`point\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_18dc786cf29d6ef99980ba6ae63\` FOREIGN KEY (\`driverId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_db8d6ef81bca1adeeb52ecbc41a\` FOREIGN KEY (\`heroId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1457f286d91f271313fded23e53\` FOREIGN KEY (\`clientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_552fdce0e344dc6d3091fce5344\` FOREIGN KEY (\`departureId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_c0766e5e1ed3566bff0fc79b572\` FOREIGN KEY (\`arrivalId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_c0766e5e1ed3566bff0fc79b572\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_552fdce0e344dc6d3091fce5344\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1457f286d91f271313fded23e53\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_db8d6ef81bca1adeeb52ecbc41a\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_18dc786cf29d6ef99980ba6ae63\``);
        await queryRunner.query(`DROP INDEX \`IDX_0964453b430bf7f2bfc4378983\` ON \`places\``);
        await queryRunner.query(`DROP TABLE \`places\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_15b3fe608b52f34df363512e39\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_c327f19d7924f50a243a41a747\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c3e3d228df59494b17a273842\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_ace513fa30d485cfd25c11a9e4\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
